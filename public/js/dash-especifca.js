const ctx = document.getElementById('grafico').getContext('2d');

const grafico = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['00h', '03h', '06h', '09h', '12h', '15h', '18h', '21h', '24h'],
        datasets: [
            {
                label: 'CPU',
                data: [38, 40, 55, 55, 62, 68, 65, 73, 80],
                borderColor: '#2196F3',
                backgroundColor: '#2196F3',
                borderWidth: 2,
                tension: 0.4,
                fill: false
            },
            {
                label: 'RAM',
                data: [57, 58, 65, 72, 75, 75, 78, 77, 74],
                borderColor: '#4CAF50',
                backgroundColor: '#4CAF50',
                borderWidth: 2,
                tension: 0.4,
                fill: false
            },
            {
                label: 'SWAP',
                data: [20, 22, 25, 23, 30, 28, 35, 32, 30],
                borderColor: '#9C27B0',
                backgroundColor: '#9C27B0',
                borderWidth: 2,
                tension: 0.4,
                fill: false
            },
            {
                label: 'Disco',
                data: [65, 67, 71, 76, 80, 83, 87, 90, 93],
                borderColor: '#FF9800',
                backgroundColor: '#FF9800',
                borderWidth: 2,
                tension: 0.4,
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 12,
                    usePointStyle: true,
                    padding: 25,
                    boxPadding: 8
                }
            }
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                },
                grid: {
                    color: '#eee'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }
});