/**
 * FlowState - ポモドーロタイマーアプリケーション
 * Copyright (c) 2025 Daily Growth
 * https://yourworklifedesign.blogspot.com/
 * All rights reserved.
 */

/**
 * DOMが読み込まれたら初期化処理を実行
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM要素の取得
    const domElements = {
        // タイマー関連
        startBtn: document.getElementById('start-btn'),
        pauseBtn: document.getElementById('pause-btn'),
        resetBtn: document.getElementById('reset-btn'),
        timeDisplay: document.querySelector('.time-display'),
        statusDisplay: document.querySelector('.status'),
        pomodoroCountDisplay: document.getElementById('pomodoro-count'),
        circleProgress: document.querySelector('.circle-progress-bar'),
        
        // 設定関連
        workTimeSlider: document.getElementById('work-time'),
        breakTimeSlider: document.getElementById('break-time'),
        workTimeDisplay: document.getElementById('work-time-display'),
        breakTimeDisplay: document.getElementById('break-time-display'),
        themeToggle: document.getElementById('theme-toggle'),
        presetButtons: document.querySelectorAll('.preset-btn'),
        
        // タスク関連
        taskForm: document.getElementById('task-form'),
        taskInput: document.getElementById('task-input'),
        pomodoroCountInput: document.getElementById('pomodoro-count-input'),
        taskList: document.getElementById('task-list'),
        totalTasksDisplay: document.getElementById('total-tasks'),
        completedTasksDisplay: document.getElementById('completed-tasks'),
        toggleCompletedBtn: document.getElementById('toggle-completed'),
        
        // その他
        focusModeToggle: document.getElementById('focus-mode'),
        notificationSound: document.getElementById('notification-sound'),
        
        // 統計関連
        todayPomodorosDisplay: document.getElementById('today-pomodoros'),
        totalTimeDisplay: document.getElementById('total-time'),
        completedTasksCountDisplay: document.getElementById('completed-tasks-count'),
        weeklyChart: document.getElementById('weekly-chart'),
        showPomodorosBtn: document.getElementById('show-pomodoros'),
        showFocusTimeBtn: document.getElementById('show-focus-time')
    };

    /**
     * タイマーの状態を管理するオブジェクト
     */
    let timer = {
        workTime: 25 * 60,        // 作業時間（秒単位）
        breakTime: 5 * 60,        // 休憩時間（秒単位）
        currentTime: 25 * 60,     // 現在のタイマー時間
        isRunning: false,         // タイマー実行中フラグ
        interval: null,           // setIntervalのID
        mode: 'work',             // 現在のモード（'work' または 'break'）
        pomodoroCount: 0,         // 完了したポモドーロの数
        startTimestamp: null,     // タイマー開始時のタイムスタンプ
        pausedTimeRemaining: null, // 一時停止時の残り時間
        targetEndTime: null       // タイマー終了予定時刻
    };

    /**
     * タスク管理配列
     */
    let tasks = [];
    
    /**
     * 表示状態管理
     */
    let hideCompleted = false;
    
    /**
     * 統計データ管理オブジェクト
     */
    let stats = {
        completedTasks: 0,
        // 週間データ（日付ごとのポモドーロ数と集中時間）
        weeklyData: [] // {date: "YYYY-MM-DD", pomodoros: 0, focusTime: 0} 形式
    };
    
    /**
     * グラフ表示モード
     */
    let chartDisplayMode = 'pomodoros'; // デフォルト表示モード
    
    /**
     * 日付チェックインターバルID
     */
    let dateCheckIntervalId = null;

    /**
     * アプリケーション初期化
     */
    function init() {
        loadFromLocalStorage();    // ローカルストレージからデータを読み込み
        initProgressCircle();      // プログレスバーを初期化
        resetTimer();              // タイマーをリセット
        setupEventListeners();     // イベントリスナーを設定
        setupDateChangeChecker();  // 日付変更チェッカーを設定
        renderTasks();             // タスクを描画
        checkDateChange();         // 日付変更をチェック
    }

    /**
     * ローカルストレージからデータを読み込む
     */
    function loadFromLocalStorage() {
        // 1. タイマー設定の読み込み
        const savedSettings = JSON.parse(localStorage.getItem('pomodoroSettings'));
        if (savedSettings) {
            timer.workTime = savedSettings.workTime;
            timer.breakTime = savedSettings.breakTime;
            domElements.workTimeSlider.value = timer.workTime / 60;
            domElements.breakTimeSlider.value = timer.breakTime / 60;
            domElements.workTimeDisplay.textContent = timer.workTime / 60;
            domElements.breakTimeDisplay.textContent = timer.breakTime / 60;
        }

        // 2. タスクデータの読み込み
        const savedTasks = JSON.parse(localStorage.getItem('pomodoroTasks'));
        if (savedTasks) {
            tasks = savedTasks;
        }

        // 3. 統計データの読み込み
        const savedStats = JSON.parse(localStorage.getItem('pomodoroStats'));
        if (savedStats) {
            stats = savedStats;
        } else {
            // 初期データがない場合は作成
            const today = formatDateYMD(new Date());
            stats = {
                completedTasks: 0,
                weeklyData: [{
                    date: today,
                    pomodoros: 0,
                    focusTime: 0
                }]
            };
            localStorage.setItem('pomodoroLastDate', new Date().toDateString());
        }
        
        // 4. テーマ設定の読み込み
        const darkMode = localStorage.getItem('pomodoroDarkMode') === 'true';
        domElements.themeToggle.checked = darkMode;
        if (darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        // 5. ポモドーロカウントの読み込み
        timer.pomodoroCount = parseInt(localStorage.getItem('pomodoroCount') || '0');
        domElements.pomodoroCountDisplay.textContent = timer.pomodoroCount;
    }

    /**
     * ローカルストレージにデータを保存
     */
    function saveToLocalStorage() {
        // 1. タイマー設定の保存
        localStorage.setItem('pomodoroSettings', JSON.stringify({
            workTime: timer.workTime,
            breakTime: timer.breakTime
        }));

        // 2. タスクデータの保存
        localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));

        // 3. 統計データの保存
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));

        // 4. テーマ設定の保存
        localStorage.setItem('pomodoroDarkMode', domElements.themeToggle.checked);

        // 5. ポモドーロカウントの保存
        localStorage.setItem('pomodoroCount', timer.pomodoroCount);
    }

    /**
     * 秒を「分:秒」形式にフォーマット
     * @param {number} seconds - 秒数
     * @return {string} フォーマットされた時間文字列
     */
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 日付をYYYY-MM-DD形式にフォーマット
     * @param {Date} date - 日付オブジェクト
     * @return {string} フォーマットされた日付文字列
     */
    function formatDateYMD(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 日付を「MM/DD」形式と曜日でフォーマット
     * @param {Date} date - 日付オブジェクト
     * @return {string} フォーマットされた日付文字列（「MM/DD\n(曜日)」形式）
     */
    function formatDateLabel(date) {
        const month = date.getMonth() + 1; // 月は0から始まるので+1
        const day = date.getDate();
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const weekday = weekdays[date.getDay()];
        return `${month}/${day}\n(${weekday})`;
    }

    /**
     * タイマー開始関数
     */
    function startTimer() {
        if (!timer.isRunning) {
            const now = new Date().getTime();
            
            if (timer.pausedTimeRemaining !== null) {
                // 一時停止状態から再開する場合
                timer.targetEndTime = now + (timer.pausedTimeRemaining * 1000);
                timer.pausedTimeRemaining = null;
            } else {
                // 新規開始する場合
                timer.currentTime = timer.mode === 'work' ? timer.workTime : timer.breakTime;
                timer.targetEndTime = now + (timer.currentTime * 1000);
            }
            
            timer.startTimestamp = now;
            timer.isRunning = true;
            // より頻繁に更新して精度を上げる
            timer.interval = setInterval(updateTimer, 100);
            
            // UI状態の更新
            domElements.startBtn.disabled = true;
            domElements.pauseBtn.disabled = false;
            
            // ステータス表示を更新
            if (timer.mode === 'work') {
                domElements.statusDisplay.textContent = '🔥作業中';
            } else {
                domElements.statusDisplay.textContent = '☕休憩中';
            }
        }
    }

    /**
     * タイマー一時停止関数
     */
    function pauseTimer() {
        if (timer.isRunning) {
            clearInterval(timer.interval);
            timer.isRunning = false;
            
            // 残り時間を計算して保存
            const now = new Date().getTime();
            const remainingMilliseconds = timer.targetEndTime - now;
            timer.pausedTimeRemaining = Math.max(0, Math.floor(remainingMilliseconds / 1000));
            
            // UI状態の更新
            domElements.startBtn.disabled = false;
            domElements.pauseBtn.disabled = true;
            
            // ステータス表示を更新
            if (timer.mode === 'work') {
                domElements.statusDisplay.textContent = '停止中(作業)';
            } else {
                domElements.statusDisplay.textContent = '停止中(休憩)';
            }
        }
    }

    /**
     * タイマーリセット関数
     */
    function resetTimer() {
        pauseTimer();
        clearInterval(timer.interval);
        
        // タイマー状態のリセット
        timer.mode = 'work';
        timer.currentTime = timer.workTime;
        timer.isRunning = false;
        timer.startTimestamp = null;
        timer.pausedTimeRemaining = null;
        timer.targetEndTime = null;
        
        // UI表示の更新
        domElements.timeDisplay.textContent = formatTime(timer.currentTime);
        domElements.statusDisplay.textContent = '作業';
        domElements.statusDisplay.style.color = 'var(--primary-color)';
        domElements.circleProgress.style.stroke = 'var(--primary-color)';
        
        // プログレスバーリセット
        updateProgressBar(0);
        
        // ボタン状態の更新
        domElements.startBtn.disabled = false;
        domElements.pauseBtn.disabled = true;
    }
    
    /**
     * タイマー更新関数
     */
    function updateTimer() {
        if (timer.isRunning) {
            const now = new Date().getTime();
            const remainingMilliseconds = timer.targetEndTime - now;
            
            if (remainingMilliseconds <= 0) {
                // タイマー終了
                clearInterval(timer.interval);
                timer.isRunning = false;
                
                // 通知を表示
                notifyTimerEnd();
                
                if (timer.mode === 'work') {
                    // 作業モードが終了した場合
                    timer.mode = 'break';
                    timer.currentTime = timer.breakTime;
                    domElements.statusDisplay.textContent = '休憩';
                    domElements.statusDisplay.style.color = 'var(--secondary-color)';
                    domElements.circleProgress.style.stroke = 'var(--secondary-color)';
                    timer.pomodoroCount++;
                    domElements.pomodoroCountDisplay.textContent = timer.pomodoroCount;
                    
                    // 統計更新
                    const today = formatDateYMD(new Date());
                    let todayEntry = stats.weeklyData.find(entry => entry.date === today);
                    
                    if (!todayEntry) {
                        todayEntry = {
                            date: today,
                            pomodoros: 0,
                            focusTime: 0
                        };
                        stats.weeklyData.unshift(todayEntry);
                        
                        // 7日分以上あれば古いものを削除
                        while (stats.weeklyData.length > 7) {
                            stats.weeklyData.pop();
                        }
                    }
                    
                    todayEntry.pomodoros++;
                    todayEntry.focusTime += timer.workTime / 60;
                    
                    updateStatisticsDisplay();
                    drawWeeklyChart();
                    
                    // 選択されているタスクのポモドーロカウントを更新
                    updateTaskPomodoro();
                } else {
                    // 休憩モードが終了した場合
                    timer.mode = 'work';
                    timer.currentTime = timer.workTime;
                    domElements.statusDisplay.textContent = '作業';
                    domElements.statusDisplay.style.color = 'var(--primary-color)';
                    domElements.circleProgress.style.stroke = 'var(--primary-color)';
                }
                
                domElements.timeDisplay.textContent = formatTime(timer.currentTime);
                
                // プログレスバーを更新
                updateProgressBar(100);
                
                domElements.startBtn.disabled = false;
                domElements.pauseBtn.disabled = true;
                
                saveToLocalStorage();
                return;
            }
            
            // 残り時間を秒単位で計算
            timer.currentTime = Math.ceil(remainingMilliseconds / 1000);
            domElements.timeDisplay.textContent = formatTime(timer.currentTime);
            
            // プログレスバーの更新
            const totalTime = timer.mode === 'work' ? timer.workTime : timer.breakTime;
            const progressPercent = 100 - (timer.currentTime / totalTime * 100);
            updateProgressBar(progressPercent);
        }
    }
    
    /**
     * プログレスバー更新関数
     * @param {number} percentComplete - 完了した割合（0-100）
     */
    function updateProgressBar(percentComplete) {
        const circle = domElements.circleProgress;
        const radius = circle.getAttribute('r');
        const circumference = 2 * Math.PI * parseFloat(radius);
        const offset = (100 - percentComplete) / 100 * circumference;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
    }
    
    /**
     * SVGプログレスバー初期化
     */
    function initProgressCircle() {
        const circle = domElements.circleProgress;
        const radius = circle.getAttribute('r');
        const circumference = 2 * Math.PI * parseFloat(radius);
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = '0';
    }
    
    /**
     * 選択されているタスクのポモドーロカウントを更新
     */
    function updateTaskPomodoro() {
        const activeTaskItem = document.querySelector('.task-item.active');
        if (activeTaskItem) {
            const taskId = activeTaskItem.dataset.id;
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            
            if (taskIndex !== -1) {
                tasks[taskIndex].completedPomodoros = (tasks[taskIndex].completedPomodoros || 0) + 1;
                renderTasks();
                saveToLocalStorage();
            }
        }
    }
    
    /**
     * タスク描画関数
     */
    function renderTasks() {
        domElements.taskList.innerHTML = '';
        
        // 完了タスク非表示設定に基づいてフィルタリング
        let tasksToRender = tasks;
        if (hideCompleted) {
            tasksToRender = tasks.filter(task => !task.completed);
        }
        
        tasksToRender.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.dataset.id = task.id;
            
            if (task.completed) {
                taskItem.classList.add('task-completed');
            }
            
            taskItem.innerHTML = `
                <div class="task-drag-handle">☰</div>
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <div class="task-pomodoro-counter">
                    ${task.completedPomodoros || 0}/${task.plannedPomodoros} 🍅
                </div>
                <button class="task-delete">×</button>
            `;
            
            // ドラッグイベント設定
            taskItem.setAttribute('draggable', 'true');
            taskItem.addEventListener('dragstart', handleDragStart);
            taskItem.addEventListener('dragover', handleDragOver);
            taskItem.addEventListener('drop', handleDrop);
            taskItem.addEventListener('dragend', handleDragEnd);
            
            // チェックボックスイベント
            const checkbox = taskItem.querySelector('.task-checkbox');
            checkbox.addEventListener('change', () => {
                const taskId = taskItem.dataset.id;
                const taskIndex = tasks.findIndex(t => t.id === taskId);
                
                if (taskIndex !== -1) {
                    tasks[taskIndex].completed = checkbox.checked;
                    
                    if (checkbox.checked) {
                        taskItem.classList.add('task-completed');
                        stats.completedTasks++;
                    } else {
                        taskItem.classList.remove('task-completed');
                        stats.completedTasks--;
                    }
                    
                    updateStatisticsDisplay();
                    updateTasksCounter();
                    saveToLocalStorage();
                }
            });
            
            // 削除ボタンイベント
            const deleteBtn = taskItem.querySelector('.task-delete');
            deleteBtn.addEventListener('click', () => {
                const taskId = taskItem.dataset.id;
                const taskIndex = tasks.findIndex(t => t.id === taskId);
                
                if (taskIndex !== -1) {
                    if (tasks[taskIndex].completed) {
                        stats.completedTasks--;
                    }
                    
                    tasks.splice(taskIndex, 1);
                    taskItem.remove();
                    updateTasksCounter();
                    updateStatisticsDisplay();
                    saveToLocalStorage();
                }
            });
            
            // タスク選択イベント
            taskItem.addEventListener('click', (e) => {
                // チェックボックスとボタンクリック以外の場合にアクティブにする
                if (!e.target.classList.contains('task-checkbox') &&
                    !e.target.classList.contains('task-delete') &&
                    !e.target.classList.contains('task-drag-handle')) {
                    
                    document.querySelectorAll('.task-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    taskItem.classList.add('active');
                }
            });
            
            domElements.taskList.appendChild(taskItem);
        });
        
        updateTasksCounter();
    }
    
    /**
     * タスクカウンター更新関数
     */
    function updateTasksCounter() {
        domElements.totalTasksDisplay.textContent = tasks.length;
        const completedCount = tasks.filter(task => task.completed).length;
        domElements.completedTasksDisplay.textContent = completedCount;
    }
    
    /**
     * 統計表示更新関数
     */
    function updateStatisticsDisplay() {
        // 今日のデータを取得
        const today = formatDateYMD(new Date());
        const todayEntry = stats.weeklyData.find(entry => entry.date === today) || { pomodoros: 0, focusTime: 0 };
        
        // 表示を更新
        domElements.todayPomodorosDisplay.textContent = todayEntry.pomodoros;
        domElements.totalTimeDisplay.textContent = todayEntry.focusTime;
        domElements.completedTasksCountDisplay.textContent = stats.completedTasks;
    }
    
    /**
     * 週間チャート描画関数
     */
    function drawWeeklyChart() {
        const svg = domElements.weeklyChart;
        svg.innerHTML = '';
        
        const width = svg.clientWidth;
        const height = svg.clientHeight;
        const padding = 40;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);

        // 記録されているデータを日付順にソート
        let chartData = [...stats.weeklyData].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        // データがない場合は早期リターン
        if (chartData.length === 0) {
            // グラフがないことを示すメッセージを表示
            const noDataText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            noDataText.setAttribute('x', width / 2);
            noDataText.setAttribute('y', height / 2);
            noDataText.setAttribute('text-anchor', 'middle');
            noDataText.setAttribute('fill', 'var(--text-color)');
            noDataText.setAttribute('font-size', '14');
            noDataText.textContent = 'データがありません';
            svg.appendChild(noDataText);
            return;
        }

        // 最大7つまでのデータを使用
        chartData = chartData.slice(0, 7);

        // 各エントリに日付オブジェクトと表示用ラベルを追加
        chartData.forEach(entry => {
            entry.dateObj = new Date(entry.date);
            entry.label = formatDateLabel(entry.dateObj);
        });

        // 最大値を計算 (現在の表示モードに基づく)
        let maxValue;
        if (chartDisplayMode === 'pomodoros') {
            maxValue = Math.max(...chartData.map(item => item.pomodoros), 1);
        } else {
            maxValue = Math.max(...chartData.map(item => item.focusTime), 1);
        }
        
        // バーの幅を計算
        const barWidth = chartWidth / chartData.length;

        // Y軸
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', padding);
        yAxis.setAttribute('y1', padding);
        yAxis.setAttribute('x2', padding);
        yAxis.setAttribute('y2', height - padding);
        yAxis.setAttribute('stroke', 'var(--text-color)');
        yAxis.setAttribute('stroke-width', '1');
        svg.appendChild(yAxis);
        
        // X軸
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', padding);
        xAxis.setAttribute('y1', height - padding);
        xAxis.setAttribute('x2', width - padding);
        xAxis.setAttribute('y2', height - padding);
        xAxis.setAttribute('stroke', 'var(--text-color)');
        xAxis.setAttribute('stroke-width', '1');
        svg.appendChild(xAxis);

        // グラフのタイトル
        const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.setAttribute('x', width / 2);
        titleText.setAttribute('y', padding / 2);
        titleText.setAttribute('text-anchor', 'middle');
        titleText.setAttribute('fill', 'var(--primary-color)');
        titleText.setAttribute('font-size', '14');
        titleText.setAttribute('font-weight', 'bold');
        titleText.textContent = chartDisplayMode === 'pomodoros' ? 
                                'ポモドーロ記録履歴' : '集中時間記録履歴 (分)';
        svg.appendChild(titleText);
          
        // バーとラベルを描画
        chartData.forEach((item, index) => {
            // 表示モードに基づいて値を取得
            const value = chartDisplayMode === 'pomodoros' ? item.pomodoros : item.focusTime;
            const barHeight = value / maxValue * chartHeight;
            const x = padding + (index * barWidth);
            const y = height - padding - barHeight;
            
            // バーの色も表示モードによって変更
            const barColor = chartDisplayMode === 'pomodoros' ? 
                            'var(--primary-color)' : 'var(--secondary-color)';
            
            // バー
            const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bar.setAttribute('x', x + 5);
            bar.setAttribute('y', y);
            bar.setAttribute('width', barWidth - 10);
            bar.setAttribute('height', barHeight);
            bar.setAttribute('fill', barColor);
            bar.setAttribute('rx', '4');
            svg.appendChild(bar);
            
            // 値ラベル
            if (value > 0) {
                const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                valueText.setAttribute('x', x + barWidth / 2);
                valueText.setAttribute('y', y - 5);
                valueText.setAttribute('text-anchor', 'middle');
                valueText.setAttribute('fill', 'var(--text-color)');
                valueText.setAttribute('font-size', '12');
                valueText.textContent = value;
                svg.appendChild(valueText);
            }

            // 日付と曜日を2行で表示
            const dateLabel = item.label.split('\n');

            // 日付ラベル (MM/DD)
            const dateText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            dateText.setAttribute('x', x + barWidth / 2);
            dateText.setAttribute('y', height - padding + 15);
            dateText.setAttribute('text-anchor', 'middle');
            dateText.setAttribute('fill', 'var(--text-color)');
            dateText.setAttribute('font-size', '12');
            dateText.textContent = dateLabel[0]; // MM/DD部分
            svg.appendChild(dateText);

            // 曜日ラベル
            const weekdayText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            weekdayText.setAttribute('x', x + barWidth / 2);
            weekdayText.setAttribute('y', height - padding + 30);
            weekdayText.setAttribute('text-anchor', 'middle');
            weekdayText.setAttribute('fill', 'var(--text-color)');
            weekdayText.setAttribute('font-size', '10');
            weekdayText.textContent = dateLabel[1]; // (曜日)部分
            svg.appendChild(weekdayText);
        });
    }
    
    /**
     * 日付変更を確認する関数
     */
    function checkDateChange() {
        const today = new Date().toDateString();
        const todayFormatted = formatDateYMD(new Date()); // YYYY-MM-DD形式の日付
        const lastDate = localStorage.getItem('pomodoroLastDate');
        
        console.log("checkDateChange lastDate:", lastDate);
        console.log("checkDateChange today:", today);
        
        if (lastDate !== today) {
            // 前回の日付がある場合、新しいエントリを追加
            const todayEntry = stats.weeklyData.find(entry => entry.date === todayFormatted);
            
            if (!todayEntry) {
                // 今日のエントリがまだなければ、新しいエントリを追加
                stats.weeklyData.unshift({
                    date: todayFormatted,
                    pomodoros: 0,
                    focusTime: 0
                });
                
                // 7日分以上あれば古いものを削除
                while (stats.weeklyData.length > 7) {
                    stats.weeklyData.pop();
                }
            }
            
            // 最終日付を更新
            localStorage.setItem('pomodoroLastDate', today);
            
            // 統計表示を更新
            updateStatisticsDisplay();
            drawWeeklyChart();
            console.log("checkDateChange ○　update!");
        } else {
            console.log("checkDateChange ×no update:");
        }
    }
    
    /**
     * アプリ起動時に日付チェック用のインターバルを設定
     */
    function setupDateChangeChecker() {
        // すでに設定されている場合はクリア
        if (dateCheckIntervalId !== null) {
            clearInterval(dateCheckIntervalId);
        }
        // 1分ごとに日付変更をチェック
        dateCheckIntervalId = setInterval(checkDateChange, 60000);
    }
    
    /**
     * ドラッグ＆ドロップ関連の変数と関数
     */
    let draggedItem = null;

    /**
     * ドラッグ開始時の処理
     * @param {DragEvent} e - ドラッグイベント
     */
    function handleDragStart(e) {
        draggedItem = this;
        setTimeout(() => {
            this.classList.add('dragging');
        }, 0);
        
        // データ転送オブジェクトの設定
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.id);
    }

    /**
     * ドラッグ中の処理
     * @param {DragEvent} e - ドラッグイベント
     */
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const target = e.target.closest('.task-item');
        if (target && target !== draggedItem) {
            const targetRect = target.getBoundingClientRect();
            const targetCenter = targetRect.top + (targetRect.height / 2);
            
            if (e.clientY < targetCenter) {
                target.parentNode.insertBefore(draggedItem, target);
            } else {
                target.parentNode.insertBefore(draggedItem, target.nextSibling);
            }
        }
    }

    /**
     * ドロップ時の処理
     * @param {DragEvent} e - ドラッグイベント
     */
    function handleDrop(e) {
        e.preventDefault();
        
        // タスク配列の順序も更新
        const newTasks = [];
        document.querySelectorAll('.task-item').forEach(item => {
            const taskId = item.dataset.id;
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                newTasks.push(task);
            }
        });
        
        tasks = newTasks;
        saveToLocalStorage();
    }

    /**
     * ドラッグ終了時の処理
     */
    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedItem = null;
    }
    
    /**
     * タイマー終了時の通知関数
     */
    function notifyTimerEnd() {
        // 音声通知
        domElements.notificationSound.play();
        
        // デスクトップ通知
        showNotification();
        
        // 画面をフラッシュさせる視覚的通知
        flashScreen();
    }

    /**
     * デスクトップ通知を表示する関数
     */
    function showNotification() {
        // ローカルファイルかどうかをチェック
        if (location.protocol === 'file:') {
            console.log('ローカル環境では通知は無効です');
            return; // ローカル環境では通知をスキップ
        }
        
        // 通知の権限をチェック
        if (Notification.permission === "granted") {
            // 通知を作成して表示
            const notification = new Notification("FlowState", {
                body: timer.mode === 'work' ? 
                    "作業時間が終了しました！休憩しましょう" : 
                    "休憩時間が終了しました！次の作業を始めましょう",
                requireInteraction: true // ユーザーが操作するまで通知を消さない
            });
            
            // 通知をクリックしたときの処理
            notification.onclick = function() {
                window.focus(); // アプリケーションウィンドウにフォーカス
                notification.close();
            };
        } else if (Notification.permission !== "denied") {
            // 通知の許可を求める
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    showNotification();
                }
            });
        }
    }

    /**
     * 画面フラッシュエフェクト
     */
    function flashScreen() {
        // フラッシュ用のオーバーレイ要素を作成
        const overlay = document.createElement('div');
        overlay.id = 'flash-overlay';
        
        // スタイル設定
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = timer.mode === 'work' ? 
            'rgba(255, 99, 71, 0.6)' : // 作業→休憩時は赤系
            'rgba(76, 175, 80, 0.6)';  // 休憩→作業時は緑系
        overlay.style.zIndex = '9999';
        overlay.style.pointerEvents = 'none'; // クリックイベントを下の要素に通す
        
        // アニメーション用のスタイル要素を作成
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            @keyframes flash-animation {
                0%, 100% { opacity: 0; }
                25%, 75% { opacity: 1; }
            }
            #flash-overlay {
                animation: flash-animation 1.2s ease-in-out 2;
            }
        `;
        
        // 要素をDOMに追加
        document.head.appendChild(styleElement);
        document.body.appendChild(overlay);
        
        // アニメーション終了後に要素を削除する
        overlay.addEventListener('animationend', () => {
            document.body.removeChild(overlay);
            document.head.removeChild(styleElement);
        });
    }
    
    /**
     * イベントリスナー設定
     */
    function setupEventListeners() {
        // タイマーコントロール
        domElements.startBtn.addEventListener('click', startTimer);
        domElements.pauseBtn.addEventListener('click', pauseTimer);
        domElements.resetBtn.addEventListener('click', resetTimer);
        
        // 作業時間スライダー
        domElements.workTimeSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            domElements.workTimeDisplay.textContent = value;
            timer.workTime = value * 60;
            
            if (timer.mode === 'work' && !timer.isRunning) {
                timer.currentTime = timer.workTime;
                domElements.timeDisplay.textContent = formatTime(timer.currentTime);
            }
            
            saveToLocalStorage();
        });
        
        // 休憩時間スライダー
        domElements.breakTimeSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            domElements.breakTimeDisplay.textContent = value;
            timer.breakTime = value * 60;
            
            if (timer.mode === 'break' && !timer.isRunning) {
                timer.currentTime = timer.breakTime;
                domElements.timeDisplay.textContent = formatTime(timer.currentTime);
            }
            
            saveToLocalStorage();
        });
        
        // テーマ切り替え
        domElements.themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            
            saveToLocalStorage();
        });
        
        // プリセットボタン
        domElements.presetButtons.forEach(button => {
            button.addEventListener('click', function() {
                const workTime = parseInt(this.dataset.work);
                const breakTime = parseInt(this.dataset.break);
                
                domElements.workTimeSlider.value = workTime;
                domElements.breakTimeSlider.value = breakTime;
                domElements.workTimeDisplay.textContent = workTime;
                domElements.breakTimeDisplay.textContent = breakTime;
                
                timer.workTime = workTime * 60;
                timer.breakTime = breakTime * 60;
                
                if (timer.mode === 'work' && !timer.isRunning) {
                    timer.currentTime = timer.workTime;
                    domElements.timeDisplay.textContent = formatTime(timer.currentTime);
                } else if (timer.mode === 'break' && !timer.isRunning) {
                    timer.currentTime = timer.breakTime;
                    domElements.timeDisplay.textContent = formatTime(timer.currentTime);
                }
                
                saveToLocalStorage();
            });
        });
        
        // タスク追加フォーム
        domElements.taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const taskText = domElements.taskInput.value.trim();
            const plannedPomodoros = parseInt(domElements.pomodoroCountInput.value) || 1;
            
            if (taskText) {
                const newTask = {
                    id: Date.now().toString(),
                    text: taskText,
                    completed: false,
                    plannedPomodoros: plannedPomodoros,
                    completedPomodoros: 0,
                    createdAt: Date.now()
                };
                
                tasks.push(newTask);
                renderTasks();
                saveToLocalStorage();
                
                domElements.taskInput.value = '';
                domElements.pomodoroCountInput.value = '1';
            }
        });
        
        // 完了タスク表示切り替え
        domElements.toggleCompletedBtn.addEventListener('click', function() {
            hideCompleted = !hideCompleted;
            renderTasks();
        });
        
        // 集中モード切り替え
        domElements.focusModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('focus-mode');
            } else {
                document.body.classList.remove('focus-mode');
            }
        });
        
        // グラフ表示切り替え
        domElements.showPomodorosBtn.addEventListener('click', function() {
            chartDisplayMode = 'pomodoros';
            domElements.showPomodorosBtn.classList.add('active');
            domElements.showFocusTimeBtn.classList.remove('active');
            drawWeeklyChart();
        });

        domElements.showFocusTimeBtn.addEventListener('click', function() {
            chartDisplayMode = 'focusTime';
            domElements.showFocusTimeBtn.classList.add('active');
            domElements.showPomodorosBtn.classList.remove('active');
            drawWeeklyChart();
        });
        
        // ウィンドウリサイズ時にグラフ再描画
        window.addEventListener('resize', drawWeeklyChart);
        
        // ブラウザ内のビジビリティ変更に対応（アクティブタブに戻ったときの処理）
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible' && timer.isRunning) {
                // タブがアクティブになった時、タイマーの表示を即時更新
                updateTimer();
            }
        });
    }
    
    // アプリケーション初期化を実行
    init();
});