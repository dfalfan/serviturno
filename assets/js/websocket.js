class WebSocketHandler {
    constructor() {
        this.conn = new WebSocket(CONFIG.WS_URL);
        this.initializeWebSocket();
    }

    initializeWebSocket() {
        this.conn.onopen = (e) => {
            console.log("Conexión establecida!");
        };

        this.conn.onmessage = (e) => {
            const parts = e.data.split("|");
            
            if (parts[0] === "Actualizar pantalla" || 
                e.data === "Nuevo ticket impreso" || 
                e.data === "Actualizar detalle") {
                $("#refresh-btn").click();
            }
            
            if (parts[0] === "Actualizar pantalla") {
                this.handleScreenUpdate(parts[1], parts[2]);
            }
        };
    }

    handleScreenUpdate(ticket, categoryName) {
        $("#ticketNumber").text(ticket);
        $("#categoryName").text(categoryName);
        
        $("#myModal").modal("show");
        
        setTimeout(() => {
            $("#myModal").modal("hide");
            $("#overlay").hide();
            $("#refresh-btn").click();
        }, 10000);
    }
} 