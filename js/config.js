/*
 * Configuración de la página de venta Adiós Chupón.
 * Edita SOLO este archivo para conectar el checkout.
 */
window.ADIOS_CHUPON_CONFIG = {
  // Pega aquí el enlace de pago del producto (por ejemplo, el enlace de checkout de tu plataforma).
  // Mientras esté vacío, los botones de compra NO llevan a ningún pago: muestran un aviso de "modo revisión".
  checkoutUrl: "",

  // Garantía: muéstrala solo si está configurada igual en la plataforma de pago.
  // Si tu plataforma no ofrece reembolso, cambia showGuarantee a false.
  showGuarantee: true,
  guaranteeDays: 7,

  // Enlaces legales (obligatorios antes de publicar). Mientras estén vacíos, se muestra un aviso.
  privacyUrl: "",
  termsUrl: "",
  contactUrl: ""
};
