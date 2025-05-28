# 📄 Presentación
---

*   **Nombre del Estudiante:** Paola de Jesús Rebollar Cruz
*   **Nombre de la Aplicación:** Inventario de Activos
*   **Enlace a la Aplicación Desplegada (GitHub Pages):** [https://dejesuspao11.github.io/Proyecto-Final/](https://dejesuspao11.github.io/Proyecto-Final/)
*   **Enlaces a la Conversación con la IA (para la realización del proyecto):**
    *   [Parte 1](https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221839atdIYVEE9GgFC0K4SxY5XlJh9-E8c%22%5D,%22action%22:%22open%22,%22userId%22:%22114195995956332701887%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing)


## ⚙️ Configuración

1.  **Configurar Supabase:**
    *   Crea un proyecto en Supabase.
    *   Crea la tabla `assets` con las columnas necesarias (`serial_number`, `make`, `model`, `status`, `vendor_id`, `asset_type_id`, `user_id`). Asegúrate de configurar las claves foráneas (`asset_type_id` referenciando a `asset_types`, `user_id` referenciando a `auth.users`, `vendor_id` referenciando a tu tabla de proveedores si la tienes).
    *   Crea la tabla `asset_types` (`asset_type_id`, `name`).
    *   Asegúrate de que la tabla `auth.users` exista (viene por defecto con Supabase Auth).
    *   Inserta algunos datos de ejemplo en `asset_types` y `assets`.
    *   **Actualiza `SUPABASE_URL` y `SUPABASE_ANON_KEY`** en todos los archivos JavaScript (`.js`) con las claves de tu proyecto Supabase (disponibles en Project Settings -> API Keys).

2.  **Configurar URLs de Redirección en Supabase:**
    *   Ve a tu panel de Supabase -> Authentication -> Settings.
    *   En "Site URL" y "Redirect URLs", añade las URLs relevantes para tu aplicación desplegada (por ejemplo, la URL de GitHub Pages como `https://dejesuspaol1.github.io/Proyecto-Final/`).
    *   Asegúrate de incluir las URLs completas para la confirmación de email y recuperación de contraseña (por ejemplo, `https://dejesuspaol1.github.io/Proyecto-Final/private/login.html` o `https://dejesuspaol1.github.io/Proyecto-Final/private/update-password.html`).

3.  **Despliegue en GitHub Pages:**
    *   Sube todo el código a tu repositorio de GitHub.
    *   En la configuración de tu repositorio en GitHub, ve a "Settings" -> "Pages".
    *   Configura el "Source" para "Deploy from a branch", selecciona la rama `main` (o la que uses) y la carpeta `/ (root)`.
    *   Haz clic en "Save". GitHub Pages construirá y desplegará tu sitio. La página principal será `index.html`.

## 🔒 Guía de Seguridad (En Proceso de Despliegue)

**Nota:** La implementación completa de las medidas de seguridad a nivel de base de datos está en proceso. Actualmente, la aplicación es funcional, pero **no es completamente segura en un entorno de producción** sin la aplicación adecuada de las políticas de seguridad. La guía a continuación describe los pasos necesarios para asegurar el proyecto en Supabase.

La seguridad de tu aplicación en Supabase se centra en la **Seguridad a Nivel de Fila (RLS)** y la gestión de accesos.

1.  **Habilitar RLS en la Tabla `assets`:**
    *   Ve a tu panel de Supabase -> Database -> Tables.
    *   Selecciona la tabla `assets`.
    *   Haz clic en "Enable RLS". **Esto bloqueará todo acceso por defecto.**

2.  **Definir Políticas de RLS para `assets`:**
    *   Ve a tu panel de Supabase -> Database -> Policies.
    *   Selecciona la tabla `assets`.
    *   Crea una nueva política:
        *   **Nombre:** `Allow anonymous read`
        *   **Aplica a:** `SELECT`
        *   **Roles Objetivo:** `anon`
        *   **Usando expresión:** `true` (Permite leer a anónimos)
        *   Guarda la política.
    *   Crea otra nueva política:
        *   **Nombre:** `Allow authenticated full access`
        *   **Aplica a:** `ALL`
        *   **Roles Objetivo:** `authenticated`
        *   **Usando expresión:** `true` (Permite leer a autenticados)
        *   **Con expresión de verificación:** `true` (Permite insertar/actualizar a autenticados)
        *   Guarda la política.

3.  **Revisar Claves API:**
    *   En Project Settings -> API Keys. Asegúrate de que **solo la clave `anon` se use en el frontend**. La clave `service_role` debe mantenerse secreta y usarse solo en entornos seguros (backend, Edge Functions).

4.  **Configurar Opciones de Autenticación:**
    *   En Authentication -> Settings. Revisa Site URL, Redirect URLs, y deshabilita proveedores no usados.

5.  **Asegurar Storage (si aplica):**
    *   Si usas Storage, ve a la sección Storage. Deshabilita "Public access" en los buckets a menos que sea necesario y define políticas de RLS para Storage.

6.  **Restricción de Dominio (Implementación Server-Side Recomendada):**
    *   La validación de dominio `@amerike.edu.mx` está implementada en el frontend (`auth.js`). Para hacer esta restricción robusta, es **altamente recomendado** implementarla también a nivel de base de datos (por ejemplo, con un trigger o una función de Supabase) ya que la validación en el frontend puede ser evadida. Esto asegurará que solo los correos del dominio permitido puedan ser registrados en el sistema de autenticación de Supabase, independientemente de la página web usada.

## ✅ Estado del Proyecto

Actualmente, la aplicación es funcional en cuanto a la navegación (desde `index.html`), visualización pública del inventario con filtros y búsqueda (en campos directos), y el flujo completo de autenticación de administrador (registro, login, recuperación de contraseña) y gestión CRUD de activos en el panel de administración.

La parte de seguridad, específicamente la configuración completa y probada de **RLS, la restricción de dominio a nivel de base de datos**, y la protección adecuada de todas las tablas, está en proceso de despliegue y verificación para garantizar que los datos estén protegidos adecuadamente en producción. El proyecto es funcional pero se recomienda **no utilizarlo con datos sensibles** hasta que se completen las medidas de seguridad a nivel de backend.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras errores o tienes sugerencias de mejora, no dudes en abrir un issue o enviar un pull request.

---