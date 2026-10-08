// Textos legales modelo. Deben revisarse por un profesional antes de usarse en producción.

export type LegalDoc = {
  slug: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
};

const RESPONSABLE = [
  // TODO: completar con razón social, CIF y domicilio reales antes de publicar
  "Titular: Recruitment Lab",
  "Domicilio: Madrid, España",
  "Email de contacto: privacidad@recruitmentlab.es",
];

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "aviso-legal",
    title: "Aviso legal",
    updated: "1 de octubre de 2026",
    sections: [
      { heading: "Titular del sitio web", body: RESPONSABLE },
      {
        heading: "Objeto",
        body: [
          "Este sitio web ofrece información sobre los servicios de reclutamiento de Recruitment Lab y permite a los candidatos consultar ofertas de empleo y presentar su candidatura.",
        ],
      },
      {
        heading: "Propiedad intelectual",
        body: [
          "Los contenidos, marcas y diseños del sitio pertenecen a Recruitment Lab o a terceros que han autorizado su uso. Queda prohibida su reproducción sin autorización.",
        ],
      },
      {
        heading: "Responsabilidad",
        body: [
          "Recruitment Lab no se responsabiliza del uso que terceros hagan de la información publicada ni de los daños derivados de interrupciones del servicio ajenas a su control.",
        ],
      },
    ],
  },
  {
    slug: "privacidad",
    title: "Política de privacidad",
    updated: "1 de octubre de 2026",
    sections: [
      { heading: "Responsable del tratamiento", body: RESPONSABLE },
      {
        heading: "Qué datos tratamos y para qué",
        body: [
          "Datos de contacto que nos facilitas en los formularios (nombre, empresa, email, teléfono y mensaje) para responder a tu solicitud y, en su caso, enviarte una propuesta comercial.",
        ],
      },
      { heading: "Base jurídica", body: ["Tu consentimiento y la aplicación de medidas precontractuales a petición tuya."] },
      { heading: "Conservación", body: ["Conservamos los datos mientras dure la relación y, después, durante los plazos legales de prescripción."] },
      {
        heading: "Tus derechos",
        body: [
          "Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a privacidad@recruitmentlab.es. También puedes reclamar ante la AEPD (www.aepd.es).",
        ],
      },
    ],
  },
  {
    slug: "privacidad-candidatos",
    title: "Política de privacidad para candidatos",
    updated: "1 de octubre de 2026",
    sections: [
      { heading: "Responsable del tratamiento", body: RESPONSABLE },
      {
        heading: "Origen de los datos",
        body: [
          "Recogemos tus datos cuando respondes a uno de nuestros anuncios en Meta (Facebook e Instagram) mediante un formulario instantáneo, y cuando completas tu candidatura en esta web.",
        ],
      },
      {
        heading: "Finalidades",
        body: [
          "Gestionar tu participación en el proceso de selección al que te has inscrito.",
          "Enviarte el enlace para completar tu candidatura y comunicaciones sobre su estado.",
          "Si lo autorizas, conservar tu CV durante 2 años para futuros procesos y enviarte ofertas similares.",
        ],
      },
      {
        heading: "Destinatarios",
        body: [
          "Si tu perfil resulta preseleccionado, compartiremos tu CV y respuestas con la empresa que ofrece el puesto, que actuará como responsable independiente para la fase de entrevistas.",
        ],
      },
      {
        heading: "Decisiones automatizadas",
        body: [
          "Las respuestas a preguntas eliminatorias y test se puntúan automáticamente como ayuda al reclutador. Ninguna candidatura se descarta sin revisión humana.",
        ],
      },
      {
        heading: "Conservación",
        body: ["Sin consentimiento de conservación, eliminamos tus datos 6 meses después de cerrar el proceso. Con consentimiento, durante 2 años."],
      },
      { heading: "Tus derechos", body: ["Escríbenos a privacidad@recruitmentlab.es para ejercer tus derechos o retirar tu consentimiento en cualquier momento."] },
    ],
  },
  {
    slug: "cookies",
    title: "Política de cookies",
    updated: "1 de octubre de 2026",
    sections: [
      {
        heading: "Qué son las cookies",
        body: ["Pequeños archivos que se guardan en tu navegador para recordar información sobre tu visita."],
      },
      {
        heading: "Cookies que usamos",
        body: [
          "Técnicas (necesarias): recuerdan tus preferencias de cookies y mantienen la sesión del panel de clientes.",
          "Analíticas (opcionales): nos ayudan a entender cómo se usa la web de forma agregada.",
          "Publicitarias (opcionales): miden la eficacia de nuestras campañas en Meta.",
        ],
      },
      { heading: "Cómo gestionarlas", body: ["Puedes cambiar tu elección en cualquier momento borrando las cookies de tu navegador."] },
    ],
  },
];
