/*
 * Configuración de la página de venta Adiós Chupón.
 * Edita SOLO este archivo para conectar el checkout.
 */
window.ADIOS_CHUPON_CONFIG = {
  // Pega aquí el enlace de pago del producto (por ejemplo, el enlace de checkout de tu plataforma).
  // Mientras esté vacío, los botones de compra NO llevan a ningún pago: muestran un aviso de "modo revisión".
  checkoutUrl: "https://pay.hotmart.com/W108503870B",

  // Garantía: muéstrala solo si está configurada igual en la plataforma de pago.
  // Si tu plataforma no ofrece reembolso, cambia showGuarantee a false.
  showGuarantee: true,
  guaranteeDays: 7,

  // Enlaces legales (obligatorios antes de publicar). Mientras estén vacíos, se muestra un aviso.
  privacyUrl: "",
  termsUrl: "",
  contactUrl: "",

  // Panel de administrador (medición del quiz). Pega aquí la URL de tu Web App de Google Apps Script.
  // Mientras esté vacío, el quiz NO envía datos a ningún lado (solo guarda un registro local para la demo).
  analyticsUrl: "",
  // Clave simple para que solo tú veas el panel (la misma que pones en el script). Opcional.
  analyticsKey: ""
};
