<script lang="ts">
    import { onMount } from 'svelte';

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

    onMount(() => {
        // 设置默认开始日期为今天
        const today = new Date();
        startDate = today.toISOString().split('T')[0];

        // 设置默认结束日期为一周后
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        endDate = nextWeek.toISOString().split('T')[0];
    });

    function calculateProgress() {
        error = '';
        results = [];

        // 验证输入
        if (!startDate || !endDate) {
            error = '请填写开始日期和截止日期';
            return;
        }

        if (totalAmount <= 0) {
            error = '总量必须大于0';
            return;
        }

        if (completedAmount < 0) {
            error = '已完成量不能为负数';
            return;
        }

        if (completedAmount >= totalAmount) {
            error = '已完成量不能大于等于总量';
            return;
        }

        // 确保精确的2位小数计算
        const preciseTotalAmount = parseFloat(totalAmount.toFixed(2));
        const preciseCompletedAmount = parseFloat(completedAmount.toFixed(2));

        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        if (end <= start) {
            error = '截止日期必须晚于开始日期';
            return;
        }

        if (end <= now) {
            error = '截止日期必须晚于当前日期';
            return;
        }

        // 计算剩余量和剩余天数
        const remainingAmount = parseFloat((preciseTotalAmount - preciseCompletedAmount).toFixed(2));

        // 计算工作日（如果不包含周末）
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

        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const remainingDays = includeWeekends
            ? Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : calculateWorkDays(now, end);

        // 计算当前进度
        const currentProgress = parseFloat(((preciseCompletedAmount / preciseTotalAmount) * 100).toFixed(2));
        const expectedProgress = parseFloat((((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100).toFixed(2));

        // 生成多种方案
        const dailyAverage = parseFloat((remainingAmount / remainingDays).toFixed(2));
        const dailyConservative = parseFloat((remainingAmount / Math.max(1, remainingDays - 1)).toFixed(2));
        const dailyAggressive = parseFloat((remainingAmount / Math.max(1, remainingDays - 3)).toFixed(2));

        // 计算完成日期的辅助函数
        function getCompletionDate(daysFromNow: number): string {
            const completionDate = new Date(now);
            completionDate.setDate(now.getDate() + daysFromNow);
            return completionDate.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }

        // 平方根方案（递减，开始快后期慢）
        function calculateSqrtPlan() {
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

        // 立方根方案（递减，但比平方根缓和）
        function calculateCbrtPlan() {
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

        // 二次抛物线方案（先增后减，中期最高）
        function calculateQuadraticPlan() {
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

        // 三次抛物线方案（更平缓的先增后减）
        function calculateCubicPlan() {
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

        const sqrtPlan = calculateSqrtPlan();
        const cbrtPlan = calculateCbrtPlan();
        const quadraticPlan = calculateQuadraticPlan();
        const cubicPlan = calculateCubicPlan();

        results = [
            {
                title: '均匀分配',
                dailyAmount: dailyAverage,
                description: `线性恒定：每天${dailyAverage.toFixed(2)}${unit}`,
                color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
                days: remainingDays,
                completionDate: getCompletionDate(remainingDays),
                efficiency: parseFloat((dailyAverage / (preciseTotalAmount / 10)).toFixed(2))
            },
            {
                title: '保守方案',
                dailyAmount: dailyConservative,
                description: `线性恒定+缓冲：每天${dailyConservative.toFixed(2)}${unit}`,
                color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
                days: Math.max(1, remainingDays - 1),
                completionDate: getCompletionDate(Math.max(1, remainingDays - 1)),
                efficiency: parseFloat((dailyConservative / (preciseTotalAmount / 10)).toFixed(2))
            },
            {
                title: '平方根递减',
                dailyAmount: sqrtPlan.averageDaily,
                description: sqrtPlan.description,
                color: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
                days: remainingDays,
                completionDate: getCompletionDate(remainingDays),
                efficiency: parseFloat((sqrtPlan.averageDaily / (preciseTotalAmount / 10)).toFixed(2))
            },
            {
                title: '立方根递减',
                dailyAmount: cbrtPlan.averageDaily,
                description: cbrtPlan.description,
                color: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
                days: remainingDays,
                completionDate: getCompletionDate(remainingDays),
                efficiency: parseFloat((cbrtPlan.averageDaily / (preciseTotalAmount / 10)).toFixed(2))
            },
            {
                title: '二次抛物线',
                dailyAmount: quadraticPlan.averageDaily,
                description: quadraticPlan.description,
                color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
                days: remainingDays,
                completionDate: getCompletionDate(remainingDays),
                efficiency: parseFloat((quadraticPlan.averageDaily / (preciseTotalAmount / 10)).toFixed(2))
            },
            {
                title: '三次抛物线',
                dailyAmount: cubicPlan.averageDaily,
                description: cubicPlan.description,
                color: 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700',
                days: remainingDays,
                completionDate: getCompletionDate(remainingDays),
                efficiency: parseFloat((cubicPlan.averageDaily / (preciseTotalAmount / 10)).toFixed(2))
            }
        ];

        // 如果当前进度落后，添加追赶方案
        if (currentProgress < expectedProgress - 5) {
            const catchUpDays = Math.max(1, Math.floor(remainingDays * 0.7));
            const dailyCatchUp = parseFloat((remainingAmount / catchUpDays).toFixed(2));
            results.push({
                title: '追赶方案（快速完成）',
                dailyAmount: dailyCatchUp,
                description: `在${catchUpDays}天内完成，每天需要${dailyCatchUp.toFixed(2)}${unit}`,
                color: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
                days: catchUpDays,
                completionDate: getCompletionDate(catchUpDays),
                efficiency: parseFloat((dailyCatchUp / (preciseTotalAmount / 10)).toFixed(2))
            });
        }
    }

    function selectPlan(index: number) {
        selectedPlan = index;
        generateDailyPlan(results[index]);
    }

    function generateDailyPlan(plan: any) {
        dailyPlan = [];
        const now = new Date();
        const remainingAmount = parseFloat((totalAmount - completedAmount).toFixed(2));
        let cumulativeAmount = parseFloat(completedAmount.toFixed(2));

        for (let i = 0; i < plan.days; i++) {
            let dailyAmount = plan.dailyAmount;

            // 根据方案类型计算每日具体量
            if (plan.title.includes('平方根')) {
                const maxDaily = parseFloat((remainingAmount * 2 / plan.days).toFixed(2));
                let totalCheck = 0;
                for (let j = 1; j <= plan.days; j++) {
                    totalCheck += maxDaily * Math.sqrt((plan.days - j + 1) / plan.days);
                }
                const adjustedMax = parseFloat((remainingAmount / totalCheck * maxDaily).toFixed(2));
                dailyAmount = parseFloat((adjustedMax * Math.sqrt((plan.days - i) / plan.days)).toFixed(2));
            } else if (plan.title.includes('立方根')) {
                const maxDaily = parseFloat((remainingAmount * 1.5 / plan.days).toFixed(2));
                let totalCheck = 0;
                for (let j = 1; j <= plan.days; j++) {
                    totalCheck += maxDaily * Math.cbrt((plan.days - j + 1) / plan.days);
                }
                const adjustedMax = parseFloat((remainingAmount / totalCheck * maxDaily).toFixed(2));
                dailyAmount = parseFloat((adjustedMax * Math.cbrt((plan.days - i) / plan.days)).toFixed(2));
            } else if (plan.title.includes('二次抛物线')) {
                const midPoint = plan.days / 2;
                const factor = 1 - Math.pow((i + 1 - midPoint) / midPoint, 2);
                let totalCheck = 0;
                for (let j = 0; j < plan.days; j++) {
                    const f = 1 - Math.pow((j + 1 - midPoint) / midPoint, 2);
                    totalCheck += Math.max(0.3, f);
                }
                const baseDaily = parseFloat((remainingAmount / totalCheck).toFixed(2));
                dailyAmount = parseFloat((baseDaily * Math.max(0.3, factor)).toFixed(2));
            } else if (plan.title.includes('三次抛物线')) {
                const midPoint = plan.days / 2;
                const factor = 1 - Math.pow((i + 1 - midPoint) / midPoint, 3);
                let totalCheck = 0;
                for (let j = 0; j < plan.days; j++) {
                    const f = 1 - Math.pow((j + 1 - midPoint) / midPoint, 3);
                    totalCheck += Math.max(0.4, Math.abs(f));
                }
                const baseDaily = parseFloat((remainingAmount / totalCheck).toFixed(2));
                dailyAmount = parseFloat((baseDaily * Math.max(0.4, Math.abs(factor))).toFixed(2));
            }

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

    function getProgressColor(progress: number): string {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 60) return 'bg-yellow-500';
        if (progress >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    }

    $: currentProgress = totalAmount > 0 ? parseFloat(((completedAmount / totalAmount) * 100).toFixed(2)) : 0;
</script>

<div class="max-w-4xl mx-auto p-6">
    <!-- 输入表单 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">📝 任务信息</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    开始日期
                </label>
                <input
                    id="startDate"
                    type="date"
                    bind:value={startDate}
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div>
                <label for="endDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    截止日期
                </label>
                <input
                    id="endDate"
                    type="date"
                    bind:value={endDate}
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div>
                <label for="totalAmount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    总量
                </label>
                <div class="flex">
                    <input
                        id="totalAmount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        bind:value={totalAmount}
                        class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="100.00"
                    />
                    <input
                        type="text"
                        bind:value={unit}
                        class="w-20 px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="unit"
                    />
                </div>
            </div>

            <div>
                <label for="completedAmount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    已完成量
                </label>
                <div class="flex">
                    <input
                        id="completedAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        bind:value={completedAmount}
                        class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="20.00"
                    />
                    <div class="w-20 px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-center">
                        {unit}
                    </div>
                </div>
            </div>

            <div>
                <label class="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                        type="checkbox"
                        bind:checked={includeWeekends}
                        class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span>包含周末</span>
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {includeWeekends ? '计算时包含周六日' : '只计算工作日（周一至周五）'}
                </p>
            </div>
        </div>

        <!-- 当前进度条 -->
        {#if totalAmount > 0}
        <div class="mt-6">
            <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">当前进度</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">{currentProgress.toFixed(2)}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                    class="h-3 rounded-full transition-all duration-300 {getProgressColor(currentProgress)}"
                    style="width: {Math.min(currentProgress, 100)}%"
                ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{completedAmount.toFixed(2)} {unit}</span>
                <span>{totalAmount.toFixed(2)} {unit}</span>
            </div>

            <!-- 进度状态提示 -->
            {#if startDate && endDate}
            <div class="mt-2 text-xs text-center">
                {#if currentProgress >= 80}
                    <span class="text-green-600 dark:text-green-400">🎉 进度良好！</span>
                {:else if currentProgress >= 50}
                    <span class="text-yellow-600 dark:text-yellow-400">⚠️ 需要加快进度</span>
                {:else}
                    <span class="text-red-600 dark:text-red-400">🚨 进度落后，需要追赶！</span>
                {/if}
            </div>
            {/if}
        </div>
        {/if}

        <div class="mt-6">
            <button
                on:click={calculateProgress}
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                🧮 计算进度方案
            </button>
        </div>

        {#if error}
        <div class="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
            <p class="text-red-700 dark:text-red-400 text-sm">❌ {error}</p>
        </div>
        {/if}
    </div>

    <!-- 计算结果 -->
    {#if results.length > 0}
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">📊 推荐方案</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each results as result, index}
            <div class="border-2 rounded-lg p-4 {result.color} transition-all duration-200 hover:shadow-lg {selectedPlan === index ? 'ring-2 ring-blue-500' : ''}">
                <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">{result.title}</h3>
                <div class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {result.dailyAmount.toFixed(2)} <span class="text-sm font-normal">{unit}/天</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{result.description}</p>

                <!-- 方案详情 -->
                <div class="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                    <div>⏱️ {result.days}天 ({result.completionDate})</div>
                    <div>📊 强度系数：{result.efficiency}/10</div>
                    <div>∫ 积分验证：{(totalAmount - completedAmount).toFixed(2)}{unit}</div>
                </div>



                <!-- 选择按钮 -->
                <button
                    on:click={() => selectPlan(index)}
                    class="w-full mt-3 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 {selectedPlan === index ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'}"
                >
                    {selectedPlan === index ? '✅ 已选择' : '📋 生成计划'}
                </button>
            </div>
            {/each}
        </div>



        <!-- 详细每日计划 -->
        {#if selectedPlan !== null && dailyPlan.length > 0}
        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">📅 详细每日计划 - {results[selectedPlan].title}</h3>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">天数</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">日期</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">当日任务</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">累计完成</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">进度</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">可视化</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {#each dailyPlan as day, i}
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                    第{day.day}天
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {day.date}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    {day.amount.toFixed(2)} {unit}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    {day.cumulative.toFixed(2)} {unit}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    {day.progress.toFixed(1)}%
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                                            <div class="h-2 rounded-full bg-blue-500 transition-all duration-300" style="width: {day.progress}%"></div>
                                        </div>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">{day.progress.toFixed(0)}%</span>
                                    </div>
                                </td>
                            </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>



            <!-- 数学分析摘要 -->
            <div class="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-center">
                    <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{results[selectedPlan].days}</div>
                    <div class="text-sm text-blue-700 dark:text-blue-300">定义域 [1,n]</div>
                </div>
                <div class="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3 text-center">
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">{results[selectedPlan].dailyAmount.toFixed(2)}</div>
                    <div class="text-sm text-green-700 dark:text-green-300">均值 μ ({unit})</div>
                </div>
                <div class="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-3 text-center">
                    <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{dailyPlan.length > 0 ? Math.max(...dailyPlan.map(d => d.amount)).toFixed(2) : 0}</div>
                    <div class="text-sm text-purple-700 dark:text-purple-300">最大值 max f(x)</div>
                </div>
                <div class="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg p-3 text-center">
                    <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{dailyPlan.length > 0 ? Math.min(...dailyPlan.map(d => d.amount)).toFixed(2) : 0}</div>
                    <div class="text-sm text-orange-700 dark:text-orange-300">最小值 min f(x)</div>
                </div>
            </div>
        </div>
        {/if}
    </div>
    {/if}
</div>

<style>
    /* 确保日期输入框在深色模式下正常显示 */
    :global(.dark) input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
    }
</style>
