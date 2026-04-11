<script lang="ts">
  import { onMount } from 'svelte';

  // Constants & Initial Parameters
  let rho_liquid = 1000; // kg/m^3 (Water)
  let g = 9.8; // N/kg
  let a_obj = 0.05; // m (Length)
  let b_obj = 0.05; // m (Width)
  let h_obj = 0.05; // m (Height)
  let rho_obj = 600; // kg/m^3 (Wood)
  let h_liquid_total = 0.2; // m (Initial liquid depth)
  let h_container = 0.3; // m (Container height)
  let w_container = 0.15; // m (Container width/diameter)
  
  // Scale Override & Lock
  let scale_override = 1.0; // Dynamic scale multiplier
  let is_scale_locked = false;
  let manual_scale = 1.5; // Meters shown in vertical space

  // Derived Values
  $: volume_obj = a_obj * b_obj * h_obj;
  $: mass_obj = volume_obj * rho_obj;
  $: weight_obj = mass_obj * g;
  
  // Container logic - Ensure container is at least as large as the object
  $: effective_w_container = Math.max(w_container, Math.max(a_obj, b_obj) + 0.001);
  $: container_base_area = effective_w_container * effective_w_container; 
  
  // Calculate equilibrium
  // F_buoyancy = Weight_obj
  // rho_liquid * g * V_submerged = weight_obj
  // V_submerged = weight_obj / (rho_liquid * g)
  $: v_submerged = Math.min(volume_obj, weight_obj / (rho_liquid * g));
  $: h_submerged = v_submerged / (a_obj * b_obj);
  $: percent_submerged = (h_submerged / h_obj) * 100;
  $: buoyancy_force = rho_liquid * g * v_submerged;
  $: is_floating = rho_obj <= rho_liquid;
  $: net_force = is_floating ? 0 : weight_obj - buoyancy_force;

  // Use a more realistic calculation: delta_h = V_submerged / (S_container - S_obj_base)
  // This accounts for the space the object takes up in the container
  $: free_surface_area = Math.max(0.000001, container_base_area - a_obj * b_obj);
  $: delta_h_liquid = v_submerged / free_surface_area;
  $: h_liquid_potential = h_liquid_total + delta_h_liquid;
  $: is_overflowing = h_liquid_potential > h_container;
  $: h_liquid_actual = Math.min(h_liquid_potential, h_container);
  $: overflow_volume = Math.max(0, (h_liquid_potential - h_container) * container_base_area);

  // UI state
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;

  function draw() {
    if (!ctx || !canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = 400;
    const logicalHeight = 500;
    
    if (canvas.width !== logicalWidth * dpr || canvas.height !== logicalHeight * dpr) {
      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;
      ctx.scale(dpr, dpr);
    }

    const width = logicalWidth;
    const height = logicalHeight;
    ctx.clearRect(0, 0, width, height);

    // Scale representation (Physical height equivalent on canvas)
    const maxVisualHeight = Math.max(h_container, h_liquid_potential, h_obj) * 1.5;
    const currentScaleValue = is_scale_locked ? manual_scale : maxVisualHeight;
    const scale = height / currentScaleValue; 
    
    // Draw Scale (e.g., 5cm or 10cm bar)
    const rulerLengthValue = currentScaleValue < 0.3 ? 0.05 : 0.1; // 5cm or 10cm depending on scale
    const rulerWidthPx = rulerLengthValue * scale;
    const rulerX = 20; 
    const rulerY = height - 20;

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rulerX, rulerY);
    ctx.lineTo(rulerX + rulerWidthPx, rulerY);
    ctx.moveTo(rulerX, rulerY - 5);
    ctx.lineTo(rulerX, rulerY + 5);
    ctx.moveTo(rulerX + rulerWidthPx, rulerY - 5);
    ctx.lineTo(rulerX + rulerWidthPx, rulerY + 5);
    ctx.stroke();

    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${(rulerLengthValue * 100).toFixed(0)}cm`, rulerX + rulerWidthPx / 2, rulerY - 8);

    // UI drawing constants - ensure everything fits in canvas
    // UI drawing constants - ensure everything fits in canvas
    const containerBottom = height - 50;
    const containerWidth = effective_w_container * scale; 
    const containerLeft = (width - containerWidth) / 2 + 30; 
    const containerRight = containerLeft + containerWidth;
    const containerHeightPx = h_container * scale;
    const containerTopY = containerBottom - containerHeightPx;

    // Draw Liquid
    const liquidTopY = containerBottom - h_liquid_actual * scale;
    
    // Background Liquid (Total)
    ctx.fillStyle = is_overflowing ? 'rgba(0, 100, 255, 0.5)' : 'rgba(0, 150, 255, 0.4)';
    ctx.fillRect(containerLeft, liquidTopY, containerWidth, h_liquid_actual * scale);

    // Draw Initial Liquid Level Indicator
    const initialLiquidTopY = containerBottom - h_liquid_total * scale;
    ctx.strokeStyle = 'rgba(0, 80, 255, 0.6)';
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(containerLeft, initialLiquidTopY);
    ctx.lineTo(containerRight, initialLiquidTopY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = 'rgba(0, 80, 255, 0.8)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`h_液 = ${h_liquid_total.toFixed(2)}m`, containerRight - 5, initialLiquidTopY - 5);

    // Draw Overflow (Visual hint)
    if (is_overflowing) {
      ctx.fillStyle = 'rgba(0, 150, 255, 0.3)';
      // Left overflow stream
      ctx.fillRect(containerLeft - 10, containerTopY, 10, 40);
      // Right overflow stream
      ctx.fillRect(containerRight, containerTopY, 10, 40);
      
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("溢出!", (containerLeft + containerRight) / 2, containerTopY - 30);
    }

    // Draw Liquid Depth Label
    ctx.fillStyle = '#1d4ed8';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`h_液' = ${h_liquid_actual.toFixed(2)}m`, containerLeft - 15, liquidTopY + (h_liquid_actual * scale) / 2);
    
    // Depth indicator line
    ctx.strokeStyle = '#1d4ed8';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(containerLeft - 10, liquidTopY);
    ctx.lineTo(containerLeft - 10, containerBottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Container
    ctx.strokeStyle = is_overflowing ? '#ef4444' : '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(containerLeft, containerTopY);
    ctx.lineTo(containerLeft, containerBottom);
    ctx.lineTo(containerRight, containerBottom);
    ctx.lineTo(containerRight, containerTopY);
    ctx.stroke();

    // Container height label
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.fillText(`h_容 = ${h_container.toFixed(2)}m`, containerRight + 5, containerTopY);

    // Draw Object
    const objWidthPx = a_obj * scale;
    const objHeightPx = h_obj * scale;
    const objX = containerLeft + containerWidth / 2 - objWidthPx / 2;
    
    let objTopY;
    if (is_floating) {
      // Floating or neutrally buoyant
      objTopY = liquidTopY - (h_obj - h_submerged) * scale;
    } else {
      // Sinking
      objTopY = containerBottom - objHeightPx;
    }

    // Draw Submerged Part (V_排 highlight)
    const submergedHeightPx = h_submerged * scale;
    const submergedTopY = Math.max(liquidTopY, objTopY);
    if (submergedHeightPx > 0) {
      ctx.fillStyle = 'rgba(0, 100, 255, 0.6)'; // Darker blue for displaced liquid
      ctx.fillRect(objX, submergedTopY, objWidthPx, submergedHeightPx);
      
      // Label for V_排
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`V_排`, objX + 5, submergedTopY + submergedHeightPx / 2 + 4);
    }

    ctx.fillStyle = is_floating ? '#f59e0b' : '#d97706'; 
    // Fill the non-submerged part or the whole object with transparency to see V_排
    ctx.globalAlpha = 0.7;
    ctx.fillRect(objX, objTopY, objWidthPx, objHeightPx);
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 2;
    ctx.strokeRect(objX, objTopY, objWidthPx, objHeightPx);

    // Draw Object Dimensions
    ctx.fillStyle = '#b45309';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.setLineDash([]);
    
    // Width label a_物
    ctx.fillText(`${a_obj.toFixed(2)}m (a)`, objX + objWidthPx / 2, objTopY - 10);
    
    // Height label h_物
    ctx.save();
    ctx.translate(objX - 10, objTopY + objHeightPx / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${h_obj.toFixed(2)}m (h)`, 0, 0);
    ctx.restore();

    // Reset alignment
    ctx.textAlign = 'left';

    // Force arrows
    const arrowX = objX + objWidthPx + 20;
    const centerY = objTopY + objHeightPx / 2;

    // Weight Arrow (Down)
    drawArrow(arrowX, centerY, centerY + 40, '#ef4444', `G = ${weight_obj.toFixed(2)} N`);
    // Buoyancy Arrow (Up)
    drawArrow(arrowX, centerY, centerY - (buoyancy_force / weight_obj) * 40, '#10b981', `F_浮 = ${buoyancy_force.toFixed(2)} N`);
  }

  function drawArrow(x: number, y1: number, y2: number, color: string, label: string) {
    if (!ctx) return;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();

    // Arrowhead
    const headLen = 10;
    const angle = Math.atan2(y2 - y1, 0);
    ctx.beginPath();
    ctx.moveTo(x, y2);
    ctx.lineTo(x - headLen * Math.cos(angle - Math.PI/6), y2 - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(x - headLen * Math.cos(angle + Math.PI/6), y2 - headLen * Math.sin(angle + Math.PI/6));
    ctx.fill();

    ctx.font = '12px sans-serif';
    ctx.fillText(label, x + 5, y2);
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    draw();
  });

  // 使用 $ 反应式声明，当任何参与计算的参数变化时，自动触发重绘
  $: if (canvas && (rho_liquid !== undefined || rho_obj !== undefined || g !== undefined || a_obj !== undefined || b_obj !== undefined || h_obj !== undefined || h_liquid_total !== undefined || w_container !== undefined || h_container !== undefined || manual_scale !== undefined || is_scale_locked !== undefined)) {
    // 使用 requestAnimationFrame 确保在浏览器重绘周期内执行，避免过于频繁或在某些情况下不生效
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(draw);
    } else {
      draw();
    }
  }

  const liquidDensities = [
    { name: '水', value: 1000 },
    { name: '盐水', value: 1030 },
    { name: '硝酸铜溶液', value: 1100 },
    { name: '食用油', value: 920 }
  ];

  const objectDensities = [
    { name: '木块', value: 600 },
    { name: '软木', value: 240 },
    { name: '冰', value: 917 },
    { name: '铁', value: 7800 },
    { name: '铜', value: 8960 },
    { name: '钢', value: 7850 },
    { name: '铝', value: 2700 },
    { name: '碳', value: 2260 },
    { name: '碳纤维', value: 1750 }
  ];
</script>

<div class="flex flex-col lg:flex-row gap-8 p-4 text-gray-800 dark:text-gray-200">
  <!-- Controls -->
  <div class="flex-1 space-y-6">
    <h2 class="text-xl font-bold mb-4">参数设置</h2>
    
    <div class="grid grid-cols-1 gap-6">
      <!-- 液体密度 -->
      <div class="space-y-2">
        <label class="block">
          <span class="text-sm font-medium">ρ_液 (kg/m³): {rho_liquid}</span>
          <div class="flex flex-col gap-1 mt-1">
            <input type="range" bind:value={rho_liquid} min="100" max="20000" step="10" class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
            <input type="number" bind:value={rho_liquid} step="10" class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800" />
          </div>
        </label>
        <div class="flex flex-wrap gap-2">
          {#each liquidDensities as item}
            <button 
              class="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded transition-colors"
              on:click={() => rho_liquid = item.value}
            >
              {item.name}
            </button>
          {/each}
        </div>
      </div>

      <!-- 重力场强度 -->
      <div class="space-y-2">
        <label class="block">
          <span class="text-sm font-medium">g (N/kg): {g}</span>
          <div class="flex flex-col gap-1 mt-1">
            <input type="range" bind:value={g} min="0" max="30" step="0.1" class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
            <input type="number" bind:value={g} step="0.1" class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800" />
          </div>
        </label>
        <div class="flex flex-wrap gap-2">
          <button class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded" on:click={() => g = 9.8}>地球 (9.8)</button>
          <button class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded" on:click={() => g = 1.6}>月球 (1.6)</button>
          <button class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded" on:click={() => g = 24.8}>木星 (24.8)</button>
        </div>
      </div>

      <!-- 物体密度 -->
      <div class="space-y-2">
        <label class="block">
          <span class="text-sm font-medium">ρ_物 (kg/m³): {rho_obj}</span>
          <div class="flex flex-col gap-1 mt-1">
            <input type="range" bind:value={rho_obj} min="10" max="25000" step="10" class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
            <input type="number" bind:value={rho_obj} step="10" class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800" />
          </div>
        </label>
        <div class="flex flex-wrap gap-2">
          {#each objectDensities as item}
            <button 
              class="px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 rounded transition-colors"
              on:click={() => rho_obj = item.value}
            >
              {item.name}
            </button>
          {/each}
        </div>
      </div>

      <!-- 液体深度与容器高度 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label class="block">
          <span class="text-sm font-medium">h_液 (m): {h_liquid_total}</span>
          <div class="flex flex-col gap-1 mt-1">
            <input type="range" bind:value={h_liquid_total} min="0.01" max="1" step="0.01" class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
            <input type="number" bind:value={h_liquid_total} step="0.01" class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800" />
          </div>
        </label>
        
        <label class="block">
          <span class="text-sm font-medium">h_容 (m): {h_container}</span>
          <div class="flex flex-col gap-1 mt-1">
            <input type="range" bind:value={h_container} min={Math.max(0.1, h_obj)} max="2" step="0.01" class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
            <input type="number" bind:value={h_container} min={h_obj} step="0.01" class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800" />
          </div>
        </label>

        <label class="block">
          <span class="text-sm font-medium">w_容 (m): {w_container}</span>
          <div class="flex flex-col gap-1 mt-1">
            <input type="range" bind:value={w_container} min={Math.max(a_obj, b_obj) + 0.001} max="1" step="0.01" class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
            <input type="number" bind:value={w_container} min={Math.max(a_obj, b_obj) + 0.001} step="0.01" class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800" />
          </div>
        </label>
      </div>

      <!-- 物体尺寸 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label class="block">
          <span class="text-sm font-medium">a_物 (m): {a_obj}</span>
          <input type="range" bind:value={a_obj} min="0.005" max="0.5" step="0.005" class="w-full h-1 mt-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
          <input type="number" bind:value={a_obj} step="0.005" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800" />
        </label>

        <label class="block">
          <span class="text-sm font-medium">b_物 (m): {b_obj}</span>
          <input type="range" bind:value={b_obj} min="0.005" max="0.5" step="0.005" class="w-full h-1 mt-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
          <input type="number" bind:value={b_obj} step="0.005" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800" />
        </label>

        <label class="block">
          <span class="text-sm font-medium">h_物 (m): {h_obj}</span>
          <input type="range" bind:value={h_obj} min="0.005" max="0.5" step="0.005" class="w-full h-1 mt-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
          <input type="number" bind:value={h_obj} step="0.005" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800" />
        </label>
      </div>

      <!-- 视觉缩放控制 -->
      <div class="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold">比例尺</span>
          <label class="flex items-center cursor-pointer gap-2">
            <input type="checkbox" bind:checked={is_scale_locked} class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <span class="text-xs">锁定</span>
          </label>
        </div>
        
        <label class="block">
          <div class="flex gap-2 items-center mt-1">
            <input type="range" bind:value={manual_scale} min="0.1" max="5" step="0.05" disabled={!is_scale_locked} class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:opacity-50" />
            <input type="number" bind:value={manual_scale} step="0.05" disabled={!is_scale_locked} class="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 disabled:opacity-50" />
            <span class="text-xs whitespace-nowrap">米 (m)</span>
          </div>
        </label>
      </div>
    </div>
  </div>

  <!-- Visualization -->
  <div class="flex-1 flex flex-col items-center">
    <canvas 
      bind:this={canvas} 
      width="400" 
      height="500" 
      class="border border-gray-200 rounded-lg bg-white dark:bg-gray-900"
    ></canvas>

    <div class="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-2">
      <span class={is_floating ? 'text-green-500' : 'text-red-500'}>{is_floating ? (h_submerged < h_obj ? '漂浮' : '悬浮') : '下沉'}</span>
      <p>V_物: {volume_obj.toFixed(4)} m³</p>
      <p>m_物: {mass_obj.toFixed(2)} kg</p>
      <p>G_物: {weight_obj.toFixed(2)} N</p>
      <p>V_排: {v_submerged.toFixed(4)} m³</p>
      <p>F_浮: {buoyancy_force.toFixed(2)} N</p>
      <p>h_浸: {h_submerged.toFixed(3)} m ({percent_submerged.toFixed(1)}%)</p>
      <p>Δh_液: {delta_h_liquid.toFixed(4)} m</p>
      <p>h_液': {h_liquid_actual.toFixed(3)} m</p>
      {#if is_overflowing}
        <p class="text-red-500 font-bold">液体溢出! V_溢: {overflow_volume.toFixed(6)} m³</p>
      {/if}
      {#if !is_floating}
        <p>F_对底: {net_force.toFixed(2)} N</p>
      {/if}
    </div>
  </div>
</div>

<style>
  input {
    padding: 0.5rem;
  }
</style>
