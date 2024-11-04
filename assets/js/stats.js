class DashboardManager {
    constructor() {
        this.currentChart = null;
        this.selects = {
            category: null,
            timeRange: null,
            graph: null
        };
        this.selectedGraphType = "averageAttentionTime";
        this.chartColors = {
            primary: 'rgb(6, 13, 54)',
            secondary: '#f47628',
            background: 'rgba(6, 13, 54, 0.1)'
        };
    }

    async init() {
        try {
            await this.initializeSelects();
            this.setupEventListeners();
            await this.loadCategories();
            // Cargar gráfico inicial
            await this.updateChart();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('Stats/obtenerCategorias');
            const categorias = await response.json();
            
            const options = categorias.map(categoria => ({
                value: categoria.id,
                label: categoria.categoria
            }));

            this.selects.category.setChoices(options, 'value', 'label', true);
            this.setDefaultValues();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    initializeSelects() {
        const selectConfig = {
            removeItemButton: false,
            searchEnabled: false,
            shouldSort: false,
            itemSelectText: ''
        };

        this.selects.category = new Choices('#category', selectConfig);
        this.selects.timeRange = new Choices('#timeRange', selectConfig);
        this.selects.graph = new Choices('#graph', selectConfig);
    }

    setDefaultValues() {
        this.selects.graph.setChoiceByValue('averageAttentionTime');
        this.selects.timeRange.setChoiceByValue('monthly');
        this.selects.category.setChoiceByValue('all');
    }

    setupEventListeners() {
        const debounceTime = 300; // ms
        
        const debouncedUpdate = this.debounce(() => this.updateChart(), debounceTime);

        document.getElementById('graph').addEventListener('change', (e) => {
            this.handleGraphChange();
            debouncedUpdate();
        });

        document.getElementById('category').addEventListener('change', debouncedUpdate);
        document.getElementById('timeRange').addEventListener('change', debouncedUpdate);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    handleGraphChange() {
        const graphType = this.selects.graph.getValue(true);
        this.selectedGraphType = graphType;
        this.toggleControls(graphType);
    }

    toggleControls(graphType) {
        const isCategoryDisabled = ['waitingTimeByCategory', 'patientDistribution'].includes(graphType);
        if (isCategoryDisabled) {
            this.selects.category.disable();
        } else {
            this.selects.category.enable();
        }
    }

    async updateChart() {
        try {
            const category = this.selects.category.getValue(true);
            const timeRange = this.selects.timeRange.getValue(true);
            const dateRange = this.calculateDateRange(timeRange);

            const data = await this.fetchChartData(category, timeRange, dateRange);
            if (data) {
                this.renderChart(data);
            }
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }

    calculateDateRange(timeRange) {
        const endDate = moment().endOf('day');
        let startDate;

        switch (timeRange) {
            case 'yearly':
                startDate = moment().subtract(1, 'years').startOf('month');
                break;
            case 'monthly':
                startDate = moment().subtract(1, 'months').startOf('day');
                break;
            case 'weekly':
                startDate = moment().subtract(1, 'weeks').startOf('day');
                break;
            case 'year':
                startDate = moment().startOf('year');
                break;
            case 'month':
                startDate = moment().startOf('month');
                break;
            default:
                startDate = moment().subtract(1, 'months').startOf('day');
        }

        return {
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD')
        };
    }

    async fetchChartData(category, timeRange, dateRange) {
        const endpoints = {
            averageAttentionTime: 'obtenerPromedioTiempoAtencion',
            patientCount: 'obtenerCantidadPacientes',
            uniquePatientCount: 'obtenerCantidadPacientesUnicos',
            patientDistribution: 'obtenerTotalPacientesPorCategoria',
            waitingTimeByCategory: 'obtenerTiempoEsperaPorCategoria'
        };

        const params = new URLSearchParams({
            fechaInicio: dateRange.startDate,
            fechaFin: dateRange.endDate,
            categoria: category,
            timeRange: timeRange
        });

        try {
            const response = await fetch(`Stats/${endpoints[this.selectedGraphType]}?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    renderChart(data) {
        if (this.currentChart) {
            this.currentChart.destroy();
        }

        const canvas = document.getElementById('dynamicChart');
        const ctx = canvas.getContext('2d');
        
        // Limpiar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const config = this.getChartConfig(data);
        this.currentChart = new Chart(ctx, config);
    }

    getChartConfig(data) {
        const configs = {
            averageAttentionTime: this.getTimeChartConfig.bind(this),
            patientCount: this.getPatientCountConfig.bind(this),
            uniquePatientCount: this.getUniquePatientCountConfig.bind(this),
            patientDistribution: this.getDistributionConfig.bind(this),
            waitingTimeByCategory: this.getWaitingTimeConfig.bind(this)
        };

        return configs[this.selectedGraphType](data);
    }

    getBaseChartConfig() {
        return {
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        };
    }

    getTimeChartConfig(data) {
        return {
            type: 'line',
            data: {
                labels: data.map(item => moment(item.fecha).format('DD/MM/YYYY')),
                datasets: [{
                    label: 'Tiempo promedio de atención (minutos)',
                    data: data.map(item => this.timeStringToMinutes(item.promedio_tiempo_atencion)),
                    fill: true,
                    borderColor: this.chartColors.primary,
                    backgroundColor: this.chartColors.background,
                    tension: 0.1
                }]
            },
            options: {
                ...this.getBaseChartConfig().options,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => `${value} min`
                        }
                    }
                }
            }
        };
    }

    getPatientCountConfig(data) {
        return {
            type: 'bar',
            data: {
                labels: data.map(item => moment(item.fecha).format('DD/MM/YYYY')),
                datasets: [{
                    label: 'Cantidad de pacientes',
                    data: data.map(item => item.cantidad_pacientes),
                    backgroundColor: this.chartColors.primary,
                    borderColor: this.chartColors.primary,
                }]
            },
            options: {
                ...this.getBaseChartConfig().options,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        };
    }

    getUniquePatientCountConfig(data) {
        return {
            type: 'bar',
            data: {
                labels: data.map(item => moment(item.fecha).format('DD/MM/YYYY')),
                datasets: [{
                    label: 'Pacientes únicos',
                    data: data.map(item => item.cantidad_pacientes_unicos),
                    backgroundColor: this.chartColors.secondary,
                    borderColor: this.chartColors.secondary,
                }]
            },
            options: {
                ...this.getBaseChartConfig().options,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        };
    }

    getDistributionConfig(data) {
        return {
            type: 'pie',
            data: {
                labels: data.map(item => item.categoria),
                datasets: [{
                    data: data.map(item => item.cantidad_pacientes),
                    backgroundColor: [
                        this.chartColors.primary,
                        this.chartColors.secondary,
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ]
                }]
            },
            options: {
                ...this.getBaseChartConfig().options,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        };
    }

    getWaitingTimeConfig(data) {
        return {
            type: 'bar',
            data: {
                labels: data.map(item => item.categoria),
                datasets: [{
                    label: 'Tiempo promedio de espera (minutos)',
                    data: data.map(item => this.timeStringToMinutes(item.promedio_tiempo_espera)),
                    backgroundColor: this.chartColors.primary,
                    borderColor: this.chartColors.primary,
                }]
            },
            options: {
                ...this.getBaseChartConfig().options,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => `${value} min`
                        }
                    }
                }
            }
        };
    }

    timeStringToMinutes(timeString) {
        if (!timeString) return 0;
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        return Math.round(hours * 60 + minutes + seconds / 60);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardManager();
    dashboard.init();
});

