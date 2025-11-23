<script lang="ts">
  // 输入数据
  let exchangeRate = 7.1;
  let converters = [
    { label: '', inputPrice: 0, inputUnit: 'cny_token', targetUnit: 'usd_token', outputPrice: 0 }
  ];

  const units = [
    { label: 'CNY/token', value: 'cny_token' },
    { label: 'CNY/k token', value: 'cny_k' },
    { label: 'CNY/m token', value: 'cny_m' },
    { label: 'USD/token', value: 'usd_token' },
    { label: 'USD/k token', value: 'usd_k' },
    { label: 'USD/m token', value: 'usd_m' },
  ];

  function getMultiplier(unit: string): number {
    if (unit === 'cny_token' || unit === 'usd_token') return 1;
    if (unit === 'cny_k' || unit === 'usd_k') return 1000;
    if (unit === 'cny_m' || unit === 'usd_m') return 1000000;
    return 1;
  }

  function addRow() {
    converters = [...converters, { label: '', inputPrice: 0, inputUnit: 'cny_token', targetUnit: 'usd_token', outputPrice: 0 }];
  }

  function removeRow(index: number) {
    converters = converters.filter((_, i) => i !== index);
  }

  // 响应式计算
  $: converters = converters.map(conv => {
    let outputPrice = 0;
    if (conv.inputPrice > 0 && exchangeRate > 0) {
      // 转换为基准 CNY per token
      let baseCnyPerToken;
      const inputMult = getMultiplier(conv.inputUnit);
      if (conv.inputUnit.startsWith('cny_')) {
        baseCnyPerToken = conv.inputPrice / inputMult;
      } else {
        baseCnyPerToken = (conv.inputPrice / inputMult) * exchangeRate;
      }

      // 转换为目标单位
      const targetMult = getMultiplier(conv.targetUnit);
      if (conv.targetUnit.startsWith('cny_')) {
        outputPrice = baseCnyPerToken * targetMult;
      } else {
        outputPrice = (baseCnyPerToken / exchangeRate) * targetMult;
      }
    }
    return { ...conv, outputPrice };
  });
</script>

<div class="max-w-4xl mx-auto">
    <!-- 标题部分 -->
    <div class="text-center mb-4">
      <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
        货币转换器
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-400">USD和CNY互换及AI API token换算工具</p>
    </div>

    <!-- 输入表单 -->
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-4 md:p-6 mb-4">

      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
          <span class="text-white text-lg">💱</span>
        </div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">转换设置</h2>
      </div>

      <!-- 汇率 -->
      <div class="mb-4">
        <label for="exchangeRate" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          💹 汇率 (1 USD = ? CNY)
        </label>
        <input
          id="exchangeRate"
          type="number"
          min="0.01"
          step="0.01"
          bind:value={exchangeRate}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="7.10"
        />
      </div>

      <!-- 价格转换器 -->
      <div class="space-y-2">
        {#each converters as conv, i}
          <div class="flex flex-col md:flex-row items-center justify-center gap-2">
            <input
              type="text"
              bind:value={conv.label}
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent flex-1"
              placeholder="标签"
            />
            <div class="flex items-center gap-1">
              <input
                type="number"
                min="0"
                step="0.01"
                bind:value={conv.inputPrice}
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-24"
                placeholder="0.00"
              />
              <select
                bind:value={conv.inputUnit}
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {#each units as unit}
                  <option value={unit.value}>{unit.label}</option>
                {/each}
              </select>
            </div>

            <span class="text-lg">⇄</span>

            <div class="flex items-center gap-1">
              <input
                type="number"
                readonly
                bind:value={conv.outputPrice}
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 w-24"
              />
              <select
                bind:value={conv.targetUnit}
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {#each units as unit}
                  <option value={unit.value}>{unit.label}</option>
                {/each}
              </select>
            </div>

            <button
              on:click={() => removeRow(i)}
              class="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-red-500/50"
              disabled={converters.length === 1}
            >
              删除
            </button>
          </div>
        {/each}

        <div class="flex justify-center">
          <button
            on:click={addRow}
            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            添加行
          </button>
        </div>
      </div>
    </div>


</div>
