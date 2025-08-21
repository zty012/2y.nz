<script lang="ts">
  import * as echarts from 'echarts';
  import { onMount } from 'svelte';
  import { quintOut } from 'svelte/easing';
  import { fly, scale } from 'svelte/transition';

  // 输入数据
  let startDate = '';
  let endDate = '';
  let totalAmount = 0.00;
  let completedAmount = 0.00;
  let unit = 'unit';
  let includeWeekends = true;

  // 计算结果
  let results: Array<{
    title: string;
    dailyAmount: number;
    description: string;
    color: string;
    days: number;
    completionDate: string;
    efficiency: number;
    icon: string;
    chartColor: string;
    dailyData: number[];
  }> = [];

  let error = '';
  let selectedPlan: number | null = null;
  let dailyPlan: Array<{
    day: number;
    date: string;
    amount: number;
    cumulative: number;
    progress: number;
  }> = [];

  // UI状态
  let isCalculating = false;
  let showResults = false;
  let animateProgress = false;

  // ECharts相关
  let chartContainer: HTMLDivElement;
  let chartInstance: echarts.ECharts | null = null;

  // 响应式变量：当前进度
  $: currentProgress = totalAmount > 0 ?
    parseFloat(((completedAmount / totalAmount) * 100).toFixed(2)) : 0;

  onMount(() => {
    // 设置默认开始日期为今天
    const today = new Date();
    startDate = today.toISOString().split('T')[0];

    // 设置默认结束日期为一周后
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    endDate = nextWeek.toISOString().split('T')[0];

    // 触发进度条动画
    setTimeout(() => animateProgress = true, 500);

    // 在组件销毁时清理图表
    return () => {
      if (chartInstance) {
        chartInstance.dispose();
      }
    };
  });

  // 工具函数：计算工作日
  function calculateWorkDays(startDate: Date, endDate: Date): number {
    let workDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (includeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
        workDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return workDays;
  }

  // 工具函数：计算完成日期
  function getCompletionDate(daysFromNow: number): string {
    const completionDate = new Date();
    completionDate.setDate(new Date().getDate() + daysFromNow);
    return completionDate.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // 工具函数：获取进度条颜色
  function getProgressColor(progress: number): string {
    if (progress >= 80) return 'from-green-400 to-green-600';
    if (progress >= 60) return 'from-yellow-400 to-yellow-600';
    if (progress >= 40) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  }

  // 获取进度状态
  function getProgressStatus(progress: number) {
    if (progress >= 80) return { text: '🎉 进度良好！', color: 'text-green-600 dark:text-green-400' };
    if (progress >= 50) return { text: '⚠️ 需要加快进度', color: 'text-yellow-600 dark:text-yellow-400' };
    return { text: '🚨 进度落后，需要追赶！', color: 'text-red-600 dark:text-red-400' };
  }

  // 生成每日数据
  function generateDailyData(planType: string, remainingAmount: number, days: number): number[] {
    const dailyData: number[] = [];

    for (let i = 0; i < days; i++) {
      let dailyAmount: number;

      if (planType === '均匀分配') {
        dailyAmount = remainingAmount / days;
      } else if (planType === '保守方案') {
        dailyAmount = remainingAmount / Math.max(1, days - 1);
      } else if (planType === '平方根递减') {
        const maxDaily = remainingAmount * 2 / days;
        let totalCheck = 0;
        for (let j = 1; j <= days; j++) {
          totalCheck += maxDaily * Math.sqrt((days - j + 1) / days);
        }
        const adjustedMax = remainingAmount / totalCheck * maxDaily;
        dailyAmount = adjustedMax * Math.sqrt((days - i) / days);
      } else if (planType === '立方根递减') {
        const maxDaily = remainingAmount * 1.5 / days;
        let totalCheck = 0;
        for (let j = 1; j <= days; j++) {
          totalCheck += maxDaily * Math.cbrt((days - j + 1) / days);
        }
        const adjustedMax = remainingAmount / totalCheck * maxDaily;
        dailyAmount = adjustedMax * Math.cbrt((days - i) / days);
      } else if (planType === '二次抛物线') {
        const midPoint = days / 2;
        const factor = 1 - Math.pow((i + 1 - midPoint) / midPoint, 2);
        let totalCheck = 0;
        for (let j = 0; j < days; j++) {
          const f = 1 - Math.pow((j + 1 - midPoint) / midPoint, 2);
          totalCheck += Math.max(0.3, f);
        }
        const baseDaily = remainingAmount / totalCheck;
        dailyAmount = baseDaily * Math.max(0.3, factor);
      } else if (planType === '三次抛物线') {
        const midPoint = days / 2;
        const factor = 1 - Math.pow((i + 1 - midPoint) / midPoint, 3);
        let totalCheck = 0;
        for (let j = 0; j < days; j++) {
          const f = 1 - Math.pow((j + 1 - midPoint) / midPoint, 3);
          totalCheck += Math.max(0.4, Math.abs(f));
        }
        const baseDaily = remainingAmount / totalCheck;
        dailyAmount = baseDaily * Math.max(0.4, Math.abs(factor));
      } else {
        // 追赶方案
        dailyAmount = remainingAmount / days;
      }

      // 确保返回有效数字
      const validAmount = isNaN(dailyAmount) || dailyAmount < 0 ? 0 : parseFloat(dailyAmount.toFixed(2));
      dailyData.push(validAmount);
    }

    return dailyData;
  }

  // 方案计算函数：平方根递减方案
  function calculateSqrtPlan(remainingAmount: number, remainingDays: number) {
    const maxDaily = parseFloat((remainingAmount * 2 / remainingDays).toFixed(2));
    let totalCheck = 0;

    for (let i = 1; i <= remainingDays; i++) {
      totalCheck += maxDaily * Math.sqrt((remainingDays - i + 1) / remainingDays);
    }

    const adjustedMax = parseFloat((remainingAmount / totalCheck * maxDaily).toFixed(2));
    const minDaily = parseFloat((adjustedMax * Math.sqrt(1 / remainingDays)).toFixed(2));

    return {
      averageDaily: parseFloat((remainingAmount / remainingDays).toFixed(2)),
      description: `√递减：${adjustedMax.toFixed(2)}→${minDaily.toFixed(2)}${unit}/天`
    };
  }

  // 方案计算函数：立方根递减方案
  function calculateCbrtPlan(remainingAmount: number, remainingDays: number) {
    const maxDaily = parseFloat((remainingAmount * 1.5 / remainingDays).toFixed(2));
    let totalCheck = 0;

    for (let i = 1; i <= remainingDays; i++) {
      totalCheck += maxDaily * Math.cbrt((remainingDays - i + 1) / remainingDays);
    }

    const adjustedMax = parseFloat((remainingAmount / totalCheck * maxDaily).toFixed(2));
    const minDaily = parseFloat((adjustedMax * Math.cbrt(1 / remainingDays)).toFixed(2));

    return {
      averageDaily: parseFloat((remainingAmount / remainingDays).toFixed(2)),
      description: `∛递减：${adjustedMax.toFixed(2)}→${minDaily.toFixed(2)}${unit}/天`
    };
  }

  // 方案计算函数：二次抛物线方案
  function calculateQuadraticPlan(remainingAmount: number, remainingDays: number) {
    const midPoint = remainingDays / 2;
    let totalCheck = 0;

    for (let i = 1; i <= remainingDays; i++) {
      const factor = 1 - Math.pow((i - midPoint) / midPoint, 2);
      totalCheck += Math.max(0.3, factor);
    }

    const baseDaily = parseFloat((remainingAmount / totalCheck).toFixed(2));
    const maxDaily = parseFloat((baseDaily * 1.5).toFixed(2));
    const minDaily = parseFloat((baseDaily * 0.3).toFixed(2));

    return {
      averageDaily: parseFloat((remainingAmount / remainingDays).toFixed(2)),
      description: `x²抛物线：${minDaily.toFixed(2)}→${maxDaily.toFixed(2)}→${minDaily.toFixed(2)}${unit}/天`
    };
  }

  // 方案计算函数：三次抛物线方案
  function calculateCubicPlan(remainingAmount: number, remainingDays: number) {
    const midPoint = remainingDays / 2;
    let totalCheck = 0;

    for (let i = 1; i <= remainingDays; i++) {
      const factor = 1 - Math.pow((i - midPoint) / midPoint, 3);
      totalCheck += Math.max(0.4, Math.abs(factor));
    }

    const baseDaily = parseFloat((remainingAmount / totalCheck).toFixed(2));
    const maxDaily = parseFloat((baseDaily * 1.3).toFixed(2));
    const minDaily = parseFloat((baseDaily * 0.4).toFixed(2));

    return {
      averageDaily: parseFloat((remainingAmount / remainingDays).toFixed(2)),
      description: `x³抛物线：${minDaily.toFixed(2)}→${maxDaily.toFixed(2)}→${minDaily.toFixed(2)}${unit}/天`
    };
  }

  // 生成ECharts配置
  function generateEChartsOption() {
    if (results.length === 0) return null;

    const maxDays = Math.max(...results.map(r => r.days));
    const xAxisData = Array.from({ length: maxDays }, (_, i) => `第${i + 1}天`);

    const series = results.map((result) => ({
      name: result.title,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 3,
        color: result.chartColor
      },
      itemStyle: {
        color: result.chartColor
      },
      areaStyle: {
        opacity: 0.1,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: result.chartColor
          },
          {
            offset: 1,
            color: 'transparent'
          }
        ])
      },
      data: result.dailyData.concat(new Array(Math.max(0, maxDays - result.dailyData.length)).fill(null))
    }));

    return {
      title: {
        text: `每日任务量变化图 (${unit})`,
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#374151'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#374151',
        borderWidth: 1,
        textStyle: {
          color: '#fff'
        },
        formatter: function (params: any) {
          if (!params || !Array.isArray(params) || params.length === 0) return '';

          let result = `<div style="margin-bottom: 5px;">${params[0]?.axisValueLabel || ''}</div>`;
          params.forEach((param: any) => {
            if (param && param.value !== null && param.value !== undefined &&
                typeof param.value === 'number' && !isNaN(param.value)) {
              result += `<div style="margin: 2px 0;">
                <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>
                ${param.seriesName}: ${param.value.toFixed(2)} ${unit}
              </div>`;
            }
          });
          return result;
        }
      },
      legend: {
        top: 'bottom',
        type: 'scroll',
        textStyle: {
          fontSize: 12,
          fontWeight: '600'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        },
        axisTick: {
          lineStyle: {
            color: '#e5e7eb'
          }
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        name: `每日任务量 (${unit})`,
        nameTextStyle: {
          color: '#374151',
          fontSize: 14,
          fontWeight: 'bold'
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        },
        axisTick: {
          lineStyle: {
            color: '#e5e7eb'
          }
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6',
            type: 'dashed'
          }
        }
      },
      series: series,
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut'
    };
  }

  // 初始化或更新图表
  function updateChart() {
    if (!chartContainer) return;

    if (!chartInstance) {
      chartInstance = echarts.init(chartContainer);

      // 添加点击事件
      chartInstance.on('click', (params: any) => {
        if (params && params.componentType === 'series' &&
            typeof params.seriesIndex === 'number' &&
            params.seriesIndex >= 0 && params.seriesIndex < results.length) {
          selectPlan(params.seriesIndex);
        }
      });
    }

    const option = generateEChartsOption();
    if (option) {
      chartInstance.setOption(option as any);
    }
  }

  // 主要计算函数
  async function calculateProgress() {
    isCalculating = true;
    error = '';
    results = [];
    showResults = false;

    // 模拟计算延迟，提供更好的用户反馈
    await new Promise(resolve => setTimeout(resolve, 800));

    // 输入验证
    if (!startDate || !endDate) {
      error = '请填写开始日期和截止日期';
      isCalculating = false;
      return;
    }

    if (totalAmount <= 0) {
      error = '总量必须大于0';
      isCalculating = false;
      return;
    }

    if (completedAmount < 0) {
      error = '已完成量不能为负数';
      isCalculating = false;
      return;
    }

    if (completedAmount >= totalAmount) {
      error = '已完成量不能大于等于总量';
      isCalculating = false;
      return;
    }

    // 精确计算
    const preciseTotalAmount = parseFloat(totalAmount.toFixed(2));
    const preciseCompletedAmount = parseFloat(completedAmount.toFixed(2));
    const remainingAmount = parseFloat((preciseTotalAmount - preciseCompletedAmount).toFixed(2));

    // 日期计算
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (end <= start) {
      error = '截止日期必须晚于开始日期';
      isCalculating = false;
      return;
    }

    if (end <= now) {
      error = '截止日期必须晚于当前日期';
      isCalculating = false;
      return;
    }

    // 计算剩余天数
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = includeWeekends
      ? Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : calculateWorkDays(now, end);

    // 计算当前进度
    const currentProgress = parseFloat(((preciseCompletedAmount / preciseTotalAmount) * 100).toFixed(2));
    const expectedProgress = parseFloat((((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100).toFixed(2));

    // 生成基础方案
    const dailyAverage = parseFloat((remainingAmount / remainingDays).toFixed(2));
    const dailyConservative = parseFloat((remainingAmount / Math.max(1, remainingDays - 1)).toFixed(2));

    // 计算特殊方案
    const sqrtPlan = calculateSqrtPlan(remainingAmount, remainingDays);
    const cbrtPlan = calculateCbrtPlan(remainingAmount, remainingDays);
    const quadraticPlan = calculateQuadraticPlan(remainingAmount, remainingDays);
    const cubicPlan = calculateCubicPlan(remainingAmount, remainingDays);

    // 组装结果
    results = [
      {
        title: '均匀分配',
        dailyAmount: dailyAverage,
        description: `线性恒定：每天${dailyAverage.toFixed(2)}${unit}`,
        color: 'from-blue-500 to-blue-600 border-blue-200 dark:border-blue-700',
        days: remainingDays,
        completionDate: getCompletionDate(remainingDays),
        efficiency: parseFloat((dailyAverage / (preciseTotalAmount / 10)).toFixed(2)),
        icon: '📈',
        chartColor: '#3B82F6',
        dailyData: generateDailyData('均匀分配', remainingAmount, remainingDays)
      },
      {
        title: '保守方案',
        dailyAmount: dailyConservative,
        description: `线性恒定+缓冲：每天${dailyConservative.toFixed(2)}${unit}`,
        color: 'from-green-500 to-green-600 border-green-200 dark:border-green-700',
        days: Math.max(1, remainingDays - 1),
        completionDate: getCompletionDate(Math.max(1, remainingDays - 1)),
        efficiency: parseFloat((dailyConservative / (preciseTotalAmount / 10)).toFixed(2)),
        icon: '🛡️',
        chartColor: '#10B981',
        dailyData: generateDailyData('保守方案', remainingAmount, Math.max(1, remainingDays - 1))
      },
      {
        title: '平方根递减',
        dailyAmount: sqrtPlan.averageDaily,
        description: sqrtPlan.description,
        color: 'from-purple-500 to-purple-600 border-purple-200 dark:border-purple-700',
        days: remainingDays,
        completionDate: getCompletionDate(remainingDays),
        efficiency: parseFloat((sqrtPlan.averageDaily / (preciseTotalAmount / 10)).toFixed(2)),
        icon: '√',
        chartColor: '#8B5CF6',
        dailyData: generateDailyData('平方根递减', remainingAmount, remainingDays)
      },
      {
        title: '立方根递减',
        dailyAmount: cbrtPlan.averageDaily,
        description: cbrtPlan.description,
        color: 'from-yellow-500 to-yellow-600 border-yellow-200 dark:border-yellow-700',
        days: remainingDays,
        completionDate: getCompletionDate(remainingDays),
        efficiency: parseFloat((cbrtPlan.averageDaily / (preciseTotalAmount / 10)).toFixed(2)),
        icon: '∛',
        chartColor: '#F59E0B',
        dailyData: generateDailyData('立方根递减', remainingAmount, remainingDays)
      },
      {
        title: '二次抛物线',
        dailyAmount: quadraticPlan.averageDaily,
        description: quadraticPlan.description,
        color: 'from-orange-500 to-orange-600 border-orange-200 dark:border-orange-700',
        days: remainingDays,
        completionDate: getCompletionDate(remainingDays),
        efficiency: parseFloat((quadraticPlan.averageDaily / (preciseTotalAmount / 10)).toFixed(2)),
        icon: '📊',
        chartColor: '#F97316',
        dailyData: generateDailyData('二次抛物线', remainingAmount, remainingDays)
      },
      {
        title: '三次抛物线',
        dailyAmount: cubicPlan.averageDaily,
        description: cubicPlan.description,
        color: 'from-indigo-500 to-indigo-600 border-indigo-200 dark:border-indigo-700',
        days: remainingDays,
        completionDate: getCompletionDate(remainingDays),
        efficiency: parseFloat((cubicPlan.averageDaily / (preciseTotalAmount / 10)).toFixed(2)),
        icon: '🎯',
        chartColor: '#6366F1',
        dailyData: generateDailyData('三次抛物线', remainingAmount, remainingDays)
      }
    ];

    // 添加追赶方案（如果需要）
    if (currentProgress < expectedProgress - 5) {
      const catchUpDays = Math.max(1, Math.floor(remainingDays * 0.7));
      const dailyCatchUp = parseFloat((remainingAmount / catchUpDays).toFixed(2));

      results.push({
        title: '追赶方案',
        dailyAmount: dailyCatchUp,
        description: `在${catchUpDays}天内完成，每天需要${dailyCatchUp.toFixed(2)}${unit}`,
        color: 'from-red-500 to-red-600 border-red-200 dark:border-red-700',
        days: catchUpDays,
        completionDate: getCompletionDate(catchUpDays),
        efficiency: parseFloat((dailyCatchUp / (preciseTotalAmount / 10)).toFixed(2)),
        icon: '🚀',
        chartColor: '#EF4444',
        dailyData: generateDailyData('追赶方案', remainingAmount, catchUpDays)
      });
    }

    isCalculating = false;
    showResults = true;

    // 延迟更新图表，确保DOM已渲染
    setTimeout(() => {
      updateChart();
    }, 100);
  }

  // 选择方案
  function selectPlan(index: number) {
    selectedPlan = index;
    generateDailyPlan(results[index]);
  }

  // 生成每日计划
  function generateDailyPlan(plan: any) {
    dailyPlan = [];
    const now = new Date();
    let cumulativeAmount = parseFloat(completedAmount.toFixed(2));

    for (let i = 0; i < plan.days; i++) {
      const dailyAmount = plan.dailyData[i];
      cumulativeAmount = parseFloat((cumulativeAmount + dailyAmount).toFixed(2));
      const currentDate = new Date(now);
      currentDate.setDate(now.getDate() + i);

      dailyPlan.push({
        day: i + 1,
        date: currentDate.toLocaleDateString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          weekday: 'short'
        }),
        amount: dailyAmount,
        cumulative: cumulativeAmount,
        progress: parseFloat(((cumulativeAmount / totalAmount) * 100).toFixed(2))
      });
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
  <div class="max-w-6xl mx-auto">
    <!-- 标题部分 -->
    <div class="text-center mb-8" in:fly={{ y: -50, duration: 600, easing: quintOut }}>
      <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
        Deadline 计算器
      </h1>
    </div>

    <!-- 输入表单 -->
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 md:p-8 mb-8"
         in:fly={{ y: 50, duration: 600, delay: 200, easing: quintOut }}>

      <div class="flex items-center gap-3 mb-8">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <span class="text-white text-xl">📝</span>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">任务信息</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <!-- 开始日期 -->
        <div class="group">
          <label for="startDate" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            🚀 开始日期
          </label>
          <input
            id="startDate"
            type="date"
            bind:value={startDate}
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-blue-300"
          />
        </div>

        <!-- 截止日期 -->
        <div class="group">
          <label for="endDate" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            🎯 截止日期
          </label>
          <input
            id="endDate"
            type="date"
            bind:value={endDate}
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-blue-300"
          />
        </div>

        <!-- 总量 -->
        <div class="group">
          <label for="totalAmount" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            📊 总量
          </label>
          <div class="flex rounded-xl overflow-hidden shadow-sm">
            <input
              id="totalAmount"
              type="number"
              min="0.01"
              step="0.01"
              bind:value={totalAmount}
              class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-blue-300"
              placeholder="100.00"
            />
            <input
              type="text"
              bind:value={unit}
              class="w-24 px-3 py-3 border-l-0 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="单位"
            />
          </div>
        </div>

        <!-- 已完成量 -->
        <div class="group">
          <label for="completedAmount" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ✅ 已完成量
          </label>
          <div class="flex rounded-xl overflow-hidden shadow-sm">
            <input
              id="completedAmount"
              type="number"
              min="0"
              step="0.01"
              bind:value={completedAmount}
              class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-blue-300"
              placeholder="20.00"
            />
            <div class="w-24 px-3 py-3 border-l-0 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-center font-medium">
              {unit}
            </div>
          </div>
        </div>
      </div>

      <!-- 周末选项 -->
      <div class="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
        <label class="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            bind:checked={includeWeekends}
            class="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
          />
          <div class="flex-1">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              📅 包含周末
            </span>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {includeWeekends ? '计算时包含周六日' : '只计算工作日（周一至周五）'}
            </p>
          </div>
        </label>
      </div>

      <!-- 当前进度条 -->
      {#if totalAmount > 0}
        <div class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
             in:scale={{ duration: 400, delay: 300 }}>
          <div class="flex justify-between items-center mb-4">
            <span class="text-lg font-bold text-gray-800 dark:text-gray-200">📈 当前进度</span>
            <span class="text-2xl font-bold bg-gradient-to-r {getProgressColor(currentProgress)} bg-clip-text text-transparent">
              {currentProgress.toFixed(1)}%
            </span>
          </div>

          <div class="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              class="h-full bg-gradient-to-r {getProgressColor(currentProgress)} rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style="width: {animateProgress ? Math.min(currentProgress, 100) : 0}%"
            >
              <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-3">
            <span class="font-medium">{completedAmount.toFixed(2)} {unit}</span>
            <span class="font-medium">{totalAmount.toFixed(2)} {unit}</span>
          </div>

          <!-- 进度状态提示 -->
          {#if startDate && endDate}
            <div class="mt-4 text-center">
              <span class="px-4 py-2 rounded-full text-sm font-bold {getProgressStatus(currentProgress).color} bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                {getProgressStatus(currentProgress).text}
              </span>
            </div>
          {/if}
        </div>
      {/if}

      <!-- 计算按钮 -->
      <div class="mt-8">
        <button
          on:click={calculateProgress}
          disabled={isCalculating}
          class="group relative w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-blue-500/50"
        >
          {#if isCalculating}
            <div class="flex items-center justify-center gap-3">
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>🧮 计算中...</span>
            </div>
          {:else}
            <span class="flex items-center justify-center gap-2">
              <span class="text-xl">🧮</span>
              计算进度方案
              <span class="text-xl group-hover:animate-bounce">✨</span>
            </span>
          {/if}
        </button>
      </div>

      <!-- 错误提示 -->
      {#if error}
        <div class="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl"
             in:fly={{ x: -50, duration: 300 }}>
          <div class="flex items-center gap-3">
            <span class="text-2xl">❌</span>
            <p class="text-red-700 dark:text-red-400 font-medium">{error}</p>
          </div>
        </div>
      {/if}
    </div>

    <!-- ECharts折线图展示 -->
    {#if showResults && results.length > 0}
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 md:p-8 mb-8"
           in:fly={{ y: 50, duration: 600, delay: 100, easing: quintOut }}>

        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span class="text-white text-xl">📊</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">方案对比图表</h2>
        </div>

        <!-- ECharts图表容器 -->
        <div class="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-inner mb-8" style="height: 500px;">
          <div bind:this={chartContainer} style="width: 100%; height: 100%;"></div>
        </div>

        <!-- 方案说明卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {#each results as result, index}
            <div class="group cursor-pointer bg-white dark:bg-gray-700 rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-lg {selectedPlan === index ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
                 on:click={() => selectPlan(index)}>
              <div class="flex items-center gap-3 mb-3">
                <div class="w-4 h-4 rounded-full" style="background-color: {result.chartColor}"></div>
                <span class="text-lg">{result.icon}</span>
                <h3 class="font-bold text-sm text-gray-800 dark:text-gray-200">{result.title}</h3>
              </div>
              <div class="text-2xl font-bold mb-2" style="color: {result.chartColor}">
                {result.dailyAmount.toFixed(2)} <span class="text-sm font-normal text-gray-600 dark:text-gray-400">{unit}/天</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">{result.description}</p>
              <div class="text-xs text-gray-500 dark:text-gray-500">
                <div>📅 {result.days}天</div>
                <div>🎯 {result.completionDate}</div>
              </div>
            </div>
          {/each}
        </div>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            💡 点击图表线条或方案卡片查看详细计划 • 鼠标悬停查看具体数值
          </p>
        </div>
      </div>
    {/if}

    <!-- 详细每日计划 -->
    {#if selectedPlan !== null && dailyPlan.length > 0}
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 md:p-8"
           in:fly={{ y: 50, duration: 600, delay: 200 }}>

        <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <span class="text-white text-sm">📅</span>
          </div>
          <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">
            详细每日计划 - {results[selectedPlan].title}
          </h3>
        </div>

        <!-- 统计摘要卡片 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{results[selectedPlan].days}</div>
            <div class="text-xs text-blue-700 dark:text-blue-300 font-medium">总天数</div>
          </div>
          <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-700 rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{results[selectedPlan].dailyAmount.toFixed(2)}</div>
            <div class="text-xs text-green-700 dark:text-green-300 font-medium">平均每天</div>
          </div>
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-200 dark:border-purple-700 rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {dailyPlan.length > 0 ? Math.max(...dailyPlan.map(d => d.amount)).toFixed(2) : 0}
            </div>
            <div class="text-xs text-purple-700 dark:text-purple-300 font-medium">最大值</div>
          </div>
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border border-orange-200 dark:border-orange-700 rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {dailyPlan.length > 0 ? Math.min(...dailyPlan.map(d => d.amount)).toFixed(2) : 0}
            </div>
            <div class="text-xs text-orange-700 dark:text-orange-300 font-medium">最小值</div>
          </div>
        </div>

        <!-- 每日计划表格 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">天数</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">日期</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">当日任务</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">累计完成</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">进度</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">可视化</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {#each dailyPlan as day, i}
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                      in:fly={{ x: -50, duration: 300, delay: i * 50 }}>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        第{day.day}天
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {day.date}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                      {day.amount.toFixed(2)} {unit}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                      {day.cumulative.toFixed(2)} {unit}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold {day.progress >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : day.progress >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}">
                        {day.progress.toFixed(1)}%
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div class="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                          <div class="h-full bg-gradient-to-r {getProgressColor(day.progress)} rounded-full transition-all duration-500 ease-out"
                               style="width: {day.progress}%"></div>
                        </div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[3rem]">
                          {day.progress.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* 确保日期输入框在深色模式下正常显示 */
  :global(.dark) input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
</style>
