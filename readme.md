# Tienda Node.js basada en Microservicios

Esta aplicación es una tienda en línea construida en Node.js y sigue la arquitectura de microservicios. El código fuente y el tutorial original están disponibles en el canal de YouTube del autor [codewithjay](https://www.youtube.com/@codewithjay).

## Contenido

1. [Requisitos](#requisitos)
2. [Instrucciones de Instalación](#instrucciones-de-instalación)
3. [Ejecución de la Aplicación](#ejecución-de-la-aplicación)
4. [Arquitectura de Microservicios](#arquitectura-de-microservicios)
5. [Servicios](#servicios)
6. [Referencias y Créditos](#referencias-y-créditos)
7. [Licencia](#licencia)

## Requisitos

Asegúrate de tener instalados los siguientes requisitos en tu sistema:

- Node.js y npm
- Docker (opcional, para ejecutar servicios en contenedores)
- MongoDB (o una instancia de MongoDB en la nube)

## Instrucciones de Instalación

1. Clona este repositorio:

   ```bash
   git clone https://github.com/IlCabezon/FoodStoreMicroservices
   ```

2. Accede al directorio del proyecto:

   ```bash
   cd FoodStoreMicroservices
   ```

3. Configura los archivos de entorno según las instrucciones del tutorial.

# Ejecución de la Aplicación

Existen varias formas de iniciar la aplicación, según tus preferencias y necesidades. A continuación, se detallan tres métodos diferentes:

## Método 1: Iniciar Servicios Individualmente

Para ejecutar cada servicio por separado, sigue estos pasos:

### Servicio de Customer

1. Accede al directorio del servicio de Customer:

   ```bash
   cd customer
   ```

2. Instala las dependencias:

   ```bash
   pnpm install
   ```

3. Inicia el servicio de Customer:

   ```bash
   pnpm start
   ```

### Servicio de Products

1. Accede al directorio del servicio de Products:

   ```bash
   cd products
   ```

2. Instala las dependencias:

   ```bash
   pnpm install
   ```

3. Inicia el servicio de Products:

   ```bash
   pnpm start
   ```

### Servicio de Shopping

1. Accede al directorio del servicio de Shopping:

   ```bash
   cd shopping
   ```

2. Instala las dependencias:

   ```bash
   pnpm install
   ```

3. Inicia el servicio de Shopping:

   ```bash
   pnpm start
   ```

## Método 2: Usar el Debugger Configurado

Para utilizar el debugger configurado, sigue estos pasos:

1. Abre tu entorno de desarrollo (por ejemplo, Visual Studio Code).
2. Inicia la aplicación utilizando la opción de depuración.

## Método 3: Docker Compose

Para ejecutar todos los servicios con Docker Compose, sigue estos pasos:

1. Asegúrate de tener Docker instalado en tu sistema.

2. En la raíz del proyecto, ejecuta el siguiente comando:

   ```bash
   docker-compose up
   ```

   Esto iniciará todos los servicios especificados en el archivo `docker-compose.yml`.

Elige el método que mejor se adapte a tus necesidades y entorno de desarrollo. ¡Disfruta explorando la aplicación!

## Arquitectura de Microservicios

La aplicación sigue una arquitectura de microservicios, dividida en varios servicios independientes. Estos servicios incluyen:

- **Servicio de Customer:** Maneja la gestión de clientes y autenticación.
- **Servicio de Products:** Encargado de la gestión de productos.
- **Servicio de Shopping:** Gestiona el carrito de compras y las órdenes de compra.

Cada servicio tiene su propia base de datos y se comunica con otros servicios mediante API REST o mensajes, siguiendo los principios de microservicios.

## Servicios

### 1. Servicio de Customer

Este servicio gestiona la información de los clientes y proporciona funcionalidades de autenticación.

### 2. Servicio de Products

El servicio Products maneja la información relacionada con los productos disponibles en la tienda.

### 3. Servicio de Shopping

El servicio Shopping se encarga de la gestión del carrito de compras y de procesar las órdenes de compra.

## Referencias y Créditos

Este proyecto se basa en el tutorial del autor "codewithjay" disponible en [codewithjay](https://www.youtube.com/@codewithjay). Agradecemos al autor por proporcionar un recurso valioso y educativo.

## Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

