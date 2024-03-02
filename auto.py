import psycopg2
import mysql.connector
from datetime import datetime, timedelta
import random
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

try:
    # Conexión a PostgreSQL
    conn_pg = psycopg2.connect(
        host="192.168.5.7",
        database="adempiere",
        user="adempiere",
        password="adempiere"
    )
    cursor_pg = conn_pg.cursor()
    logging.info('Conexión a PostgreSQL establecida.')
    
    # Ejecutar consulta en PostgreSQL
    query_pg = """
            SELECT 
            A.created AS "Fecha",
            a.xx_admission AS "Admision", 
            D.NAME AS "Paciente", 
            C.NAME AS "Tipo", 
            cat.id AS "ID_Área",
            cat.categoria AS "Área",
            d.value AS "Cedula",
            EXTRACT(YEAR FROM age(CURRENT_DATE, d.birthday)) AS "Edad",
            seg.name AS "Seguro",
            emp.name AS "Empresa",
            CASE 
                WHEN seg.name = 'PARTICULAR' THEN 'p'
                ELSE 's'
            END AS "P/S"
        FROM C_Order A
        INNER JOIN C_OrderLine B ON B.C_Order_ID = A.C_ORDER_ID
        INNER JOIN M_Product C ON C.M_Product_ID = B.M_Product_ID
        INNER JOIN xx_inf_radiol_ct ct ON C.NAME = ct.name
        INNER JOIN xx_inf_radiol_cat cat ON ct.id_categoria = cat.id
        INNER JOIN c_bpartner D ON A.c_bpartner_id = D.c_bpartner_id
        INNER JOIN C_BPartner_Location dip ON dip.C_BPartner_ID = D.C_BPartner_ID
        INNER JOIN C_BPartner seg ON seg.C_BPartner_ID = A.xx_insurance_id
        INNER JOIN C_BPartner emp ON emp.C_BPartner_ID = A.xx_company_id
        WHERE C.M_Product_Category_ID = 1000160 AND a.issotrx='Y' AND A.c_doctypetarget_id <> 1000027
        AND a.docstatus <> 'VO' AND B.ISACTIVE = 'Y'
        AND A.created >= CURRENT_DATE - INTERVAL '377 days'
        ORDER BY A.created ASC;

        """
    cursor_pg.execute(query_pg)
    rows = cursor_pg.fetchall()
    
    # Conexión a MySQL
    conn_mysql = mysql.connector.connect(
        host="localhost",
        database="serviturno_im",
        user="root",
        password="prevaler"
    )
    cursor_mysql = conn_mysql.cursor()
    logging.info('Conexión a MySQL establecida.')

    # Diccionario para almacenar los últimos números de ticket por categoría y fecha
    ultimos_tickets = {}
    admisiones_tickets = {}
    # Diccionario para almacenar los estudios por admisión y categoría
    estudios_por_admision_y_categoria = {}

    
    
    # Opciones para el campo 'tecnico'
    opciones_tecnico = ["N/A", "YL", "MC", "RS", "YP", "AL", "BA", "AR", "SR"]

    # Diccionario de técnicos por tipo de estudio
    tecnicos_por_area = {
    'Rayos X': ['YL', 'MC'],
    'Densitometría': ['YL', 'MC'],
    'Mamografía': ['YL', 'MC'],
    'Tomografía': ['YP', 'AR'],
    'Resonancia': ['AL', 'BA'],
    'Ecografía 1': ['N/A']
    }   

    # Procesar e insertar filas
    for row in rows:
        fecha = row[0]
        admision = row[1]
        paciente = row[2]
        tipo = row[3]
        id_categoria = row[4]
        area_nombre = row[5] 
        cedula = row[6]
        edad = row[7]
        seguro = row[8]
        empresa = row[9]
        ps = row[10]

    # Obtener la fecha y la categoría para esta fila
        fecha_str = fecha.strftime('%Y-%m-%d')
        categoria = id_categoria  # Suponiendo que id_categoria es una representación única de la categoría

    #Verificar solo admisiones del sur
        if not str(admision).startswith("2"):
            logging.info(f"Admisión {admision} no empieza con '2'. Ignorando.")
            continue

        clave_unica = (admision, id_categoria)

     # Verificar si la clave única ya existe en el diccionario
        if clave_unica in estudios_por_admision_y_categoria:
            # Agregar el nuevo estudio a la lista existente
            estudios_por_admision_y_categoria[clave_unica].append(tipo)
        else:
            # Crear una nueva entrada en el diccionario
            estudios_por_admision_y_categoria[clave_unica] = [tipo]

        # Asignar técnico según el tipo de estudio
        tecnico = random.choice(tecnicos_por_area.get(area_nombre, ['N/A']))
        logging.info(f'Área: {area_nombre}, Técnico asignado: {tecnico}')

    # Verificar si el tipo de estudio ya existe en la tabla `tipo_estudio` de MySQL
        query_check_tipo = "SELECT id FROM tipo_estudio WHERE name = %s"
        cursor_mysql.execute(query_check_tipo, (tipo,))
        tipo_row = cursor_mysql.fetchone()
        cursor_mysql.fetchall()

        if tipo_row is None:
            # Insertar el nuevo tipo en la tabla `tipo_estudio`
            query_insert_tipo = "INSERT INTO tipo_estudio (name) VALUES (%s)"
            cursor_mysql.execute(query_insert_tipo, (tipo,))
            tipo_id = cursor_mysql.lastrowid
            logging.info(f'Tipo de estudio insertado con ID: {tipo_id}')
        else:
            tipo_id = tipo_row[0]
            logging.info(f'Tipo de estudio existente con ID: {tipo_id}')

    # Generar fechas y tiempos aleatorios
        fecha_atendida = fecha + timedelta(minutes=random.randint(2, 60))
        tiempo_para_atencion = fecha_atendida - fecha


        # Obtener el último número de ticket para esta categoría y fecha
        ultimo_ticket = ultimos_tickets.get((fecha_str, categoria), 0)

        # Incrementar el número de ticket
        nuevo_ticket = ultimo_ticket + 1

        # Actualizar el diccionario con el nuevo número de ticket
        ultimos_tickets[(fecha_str, categoria)] = nuevo_ticket


    # Consulta para insertar en MySQL
        query_mysql = """INSERT INTO cola (id_categoria, fecha, atendida, fecha_atendida, tiempo_para_atencion, admision, paciente, cedula, seguro, tecnico, ps, empresa, edad, num_actual)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""

        values = (id_categoria, fecha, 1, fecha_atendida, tiempo_para_atencion, admision, paciente, cedula, seguro, tecnico, ps, empresa, edad, nuevo_ticket)

        cursor_mysql.execute(query_mysql, values)
        cursor_mysql.fetchall()
        logging.info(f'Fila insertada con éxito.')

    # Confirmar transacción en MySQL
        conn_mysql.commit()
        
    # Obtener el último ID insertado en la tabla `cola`
        cola_id = cursor_mysql.lastrowid

    # Insertar en la tabla `cola_tipo`
        query_insert_cola_tipo = "INSERT INTO cola_tipo (cola_id, tipo_estudio_id) VALUES (%s, %s)"
        cursor_mysql.execute(query_insert_cola_tipo, (cola_id, tipo_id))
        cursor_mysql.fetchall()

        if cursor_mysql.rowcount == 0:
            logging.error('Fallo al insertar en cola_tipo')

    logging.info('Transacción confirmada.')
    print(estudios_por_admision_y_categoria)


except Exception as e:
    print(f"Se produjo un error: {e}")
    logging.error(f"Se produjo un error: {e}")

finally:
    # Cerrar todas las conexiones
    cursor_pg.close()
    conn_pg.close()
    cursor_mysql.close()  # Sin argumentos adicionales
    conn_mysql.close()
    logging.info('Conexiones cerradas.')