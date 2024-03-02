<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Prevaler</title>
    <style>
        body,
        html {
            margin: 0;
            padding: 0;
            height: 100%;
            font-family: Arial, sans-serif;
        }

        .bg-image {
            position: fixed;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            background-image: url('<?= base_url("assets/images/rxt2.jpg") ?>');
            background-size: cover;
            background-position: center;
            filter: blur(8px);
            z-index: -1;
            /* Asegurarse de que el fondo esté detrás del contenido */
        }

        .container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .login-box {
            border: 1px solid #ccc;
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            padding-right: 40px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            width: 300px;
        }

        h1 {
            text-align: center;
            margin-bottom: 20px;
        }

        .input-group {
            margin-bottom: 15px;
        }

        .input-group label {
            display: inline-block;
            width: 100px;
        }

        input {
            padding: 8px;
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        .navbar-logo {
            float: Left;
            margin-left: 5px;
            margin-top: -4px;
            height: 50px;
            width: 210px;
            padding: 20px 5px;
            text-align: Right;
            font-size: 40px;
            line-height: 20px
        }
    </style>

<body>

    <nav>
        <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; box-shadow: 0 3px 6px rgba(0,0,0,.16);">
            <embed class="navbar-logo" src="<?php echo base_url() . 'assets/images/logo_new.png' ?>">
            <div style="display: flex; gap: 15px; margin-right: 30px;">

            </div>
        </div>
    </nav>
    <div class="bg-image"></div>
    <div class="container">
        <div class="login-box">
            <h1>Acceder</h1>
            <form id="login-form">
                <div class="input-group">
                    <label for="username">Cedula</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="input-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit">Acceder</button>
            </form>
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('login-form');

            form.addEventListener('submit', function(event) {
                event.preventDefault();
                const patientID = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                localStorage.setItem('patientID', patientID);

                // Simulando la validación de contraseña (esto es solo para fines de demostración)
                if (password === 'demo') {
                    // Realizar la búsqueda en la API de Orthanc
                    fetch('http://192.168.5.29/tools/find', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                Level: 'Patient',
                                Query: {
                                    PatientID: patientID,
                                },
                            }),
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.length > 0) {
                                alert('Login exitoso!');
                                window.location.href = 'http://app.prevaler.com/serviturno/imagenologia/project2'; // Redirigir a la página project2
                            } else {
                                alert('Credenciales incorrectas');
                            }
                        })
                        .catch(error => {
                            console.error('Error en la búsqueda:', error);
                        });
                } else {
                    alert('Credenciales incorrectas');
                }
            });
        });
    </script>
</body>



</html>