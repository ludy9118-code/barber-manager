export interface TreatmentAftercare {
  phase: string;
  days: string;
  title: string;
  tips: string[];
  warning?: string;
}

export interface TreatmentReminder {
  daysAfter: number;
  emoji: string;
  title: string;
  message: string;
}

export interface TreatmentInfo {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  durationEffect: string;
  nextVisitDays: { min: number; max: number };
  aftercare: TreatmentAftercare[];
  productsToUse: string[];
  productsToAvoid: string[];
  reminders: TreatmentReminder[];
  proTips: string[];
}

export const TREATMENTS: TreatmentInfo[] = [
  {
    id: 'keratina',
    name: 'Keratina',
    icon: '✨',
    tagline: 'Alisado y nutrición profunda con proteína de queratina',
    durationEffect: '3 a 6 meses dependiendo del tipo de cabello y los cuidados',
    nextVisitDays: { min: 90, max: 180 },
    aftercare: [
      {
        phase: 'Crítica',
        days: 'Primeras 72 horas',
        title: 'No toques tu cabello',
        tips: [
          'NO laves el cabello bajo ninguna circunstancia',
          'NO lo ates, recoja ni uses pinches o elásticos',
          'Evita el sudor excesivo — nada de ejercicio intenso',
          'Evita lluvia, humedad y vapor (no te duches con el cabello)',
          'Duerme con el cabello suelto, idealmente sobre funda de seda o satén',
          'Si se forma algún doblez accidental, alísalo de inmediato con la plancha',
        ],
        warning: 'Estas 72 horas son cruciales. Cualquier marca, doblez o humedad en este período puede quedar permanente en la queratina.',
      },
      {
        phase: 'Primera semana',
        days: 'Día 4 al 7',
        title: 'Primer lavado — con cuidado',
        tips: [
          'Usa SOLO shampoo libre de sulfatos (sin SLS / SLES)',
          'No uses acondicionador en las raíces — solo de medios a puntas',
          'Lava con agua tibia, nunca muy caliente',
          'Seca con toalla suavemente (no frotes) y lústralo de inmediato con la plancha o secador',
          'Evita salir con el cabello húmedo',
        ],
      },
      {
        phase: 'Mantenimiento',
        days: 'Semana 2 en adelante',
        title: 'Rutina de cuidado diario',
        tips: [
          'Lava máximo 3 veces por semana para prolongar el efecto',
          'Aplica mascarilla de queratina 1 vez por semana',
          'Usa siempre protector térmico antes de planchar o secar',
          'Evita la piscina con cloro y el agua de mar — si nadas, usa gorra',
          'No uses elásticos metálicos ni pinches con presión',
          'Cepilla de puntas hacia arriba para desenredar sin romper',
        ],
      },
    ],
    productsToUse: [
      'Shampoo libre de sulfatos (SLS-free / SLES-free)',
      'Acondicionador libre de parabenos',
      'Mascarilla de queratina o proteína (1x por semana)',
      'Protector térmico en spray o crema',
      'Serum de argan o aceite de coco en puntas',
    ],
    productsToAvoid: [
      'Shampoo con sulfato de sodio (SLS) o lauril sulfato',
      'Shampoo anticaspa agresivo',
      'Cualquier producto con sal (cloruro de sodio) en primeros ingredientes',
      'Tintes o coloraciones por al menos 2 semanas',
      'Productos con alcohol en alto porcentaje',
    ],
    reminders: [
      {
        daysAfter: 3,
        emoji: '🚿',
        title: '¡Ya puedes lavar tu cabello!',
        message: 'Han pasado 72 horas. Recuerda usar solo shampoo libre de sulfatos y agua tibia. ¡Este es el momento que esperabas!',
      },
      {
        daysAfter: 7,
        emoji: '💆',
        title: 'Primera mascarilla esta semana',
        message: 'Es el momento ideal para tu primera mascarilla de queratina. Déjala actuar 15-20 minutos con calor para máximos resultados.',
      },
      {
        daysAfter: 14,
        emoji: '✅',
        title: '2 semanas — ¿cómo se siente?',
        message: 'Tu cabello ya se adaptó a la queratina. Recuerda evitar la piscina y el mar, y continúa con tu shampoo libre de sulfatos.',
      },
      {
        daysAfter: 30,
        emoji: '🌟',
        title: '¡Un mes con tu keratina!',
        message: 'La queratina está en su mejor momento. ¡Continúa con los cuidados para que dure el mayor tiempo posible!',
      },
      {
        daysAfter: 90,
        emoji: '⏰',
        title: 'Mantenimiento de queratina',
        message: 'Tu queratina está comenzando a necesitar refuerzo. Considera un tratamiento de mantenimiento o una nueva aplicación pronto.',
      },
      {
        daysAfter: 150,
        emoji: '💇',
        title: 'Es tiempo de renovar tu queratina',
        message: 'Han pasado 5 meses desde tu queratina. ¡Contáctanos para agendar tu próxima sesión y mantener ese cabello impecable!',
      },
    ],
    proTips: [
      'Para prolongar el efecto, lava tu cabello máximo 2-3 veces por semana',
      'El agua de la piscina y el mar son los mayores enemigos de la queratina — siempre usa gorra',
      'El calor de la plancha activa la queratina, úsala regularmente para reforzar el efecto',
      'Si sientes el cabello opaco, una mascarilla de proteína puede revitalizarlo',
      'La queratina no solo alisa — nutre y repara el daño del calor y la coloración',
    ],
  },
  {
    id: 'decoloracion',
    name: 'Decoloración',
    icon: '🌕',
    tagline: 'Elevación del tono natural para coloraciones rubias o pastel',
    durationEffect: 'Permanente (el cabello decolorado no vuelve a su color original)',
    nextVisitDays: { min: 60, max: 90 },
    aftercare: [
      {
        phase: 'Inmediata',
        days: 'Primeras 48 horas',
        title: 'Hidratación urgente',
        tips: [
          'Aplica mascarilla hidratante o de proteínas al lavar',
          'Usa agua fría o tibia — el agua caliente reseca más el cabello decolorado',
          'No uses calor de planchas en los primeros 2 días',
          'Evita el sol directo en el cabello',
        ],
        warning: 'El cabello recién decolorado es muy poroso y frágil. El exceso de calor puede causar quiebre.',
      },
      {
        phase: 'Primera semana',
        days: 'Días 3 al 7',
        title: 'Reconstrucción capilar',
        tips: [
          'Realiza un baño de crema o tratamiento de reconstrucción',
          'Usa shampoo para cabello rubio o decolorado (matizante si corresponde)',
          'Aplica aceite nutritivo en puntas antes de dormir',
          'Usa siempre protector térmico',
        ],
      },
      {
        phase: 'Mantenimiento',
        days: 'Semana 2 en adelante',
        title: 'Rutina de nutrición constante',
        tips: [
          'Mascarilla nutritiva 2 veces por semana',
          'Shampoo matizador (violeta o azul) cada 2-3 lavados para evitar amarillo',
          'Evita el sol sin protector capilar con filtro UV',
          'Programa retoques de raíz cada 6-8 semanas según crecimiento',
        ],
      },
    ],
    productsToUse: [
      'Shampoo matizador violeta o azul',
      'Mascarilla reconstructora o de proteínas',
      'Aceite de argán o tratamiento nutritivo',
      'Protector térmico de alta protección',
      'Protector solar capilar con filtro UV',
    ],
    productsToAvoid: [
      'Shampoo con sulfatos agresivos',
      'Productos con alcohol que reseque',
      'Exceso de sol sin protección capilar',
    ],
    reminders: [
      {
        daysAfter: 2,
        emoji: '💧',
        title: 'Hidrata hoy',
        message: 'Recuerda hacer tu baño de crema o mascarilla reconstituente. ¡El cabello decolorado necesita hidratación constante!',
      },
      {
        daysAfter: 7,
        emoji: '💜',
        title: 'Momento del shampoo matizador',
        message: 'Si notas tonos amarillos, este es el momento de usar tu shampoo violeta. Déjalo 3-5 minutos y enjuaga.',
      },
      {
        daysAfter: 45,
        emoji: '🌱',
        title: 'Revisión de raíces',
        message: 'Es posible que las raíces ya sean visibles. Agenda tu retoque para mantener un resultado impecable.',
      },
      {
        daysAfter: 90,
        emoji: '✨',
        title: 'Mantenimiento completo',
        message: '¡Es hora de una sesión completa! Agenda con nosotros para evaluar el estado de tu color y realizarte los cuidados necesarios.',
      },
    ],
    proTips: [
      'El shampoo matizador violeta neutraliza el amarillo — no lo dejes más de 5 min la primera vez',
      'Dormir con el cabello trenzado o recogido reduce el frizz en cabello decolorado',
      'Una mascarilla de proteínas 1x por semana puede hacer una diferencia enorme en la textura',
      'Evita el cloro de piscinas — puede tornar el rubio verde',
    ],
  },
  {
    id: 'tinte',
    name: 'Tinte',
    icon: '🎨',
    tagline: 'Coloración permanente o semipermanente personalizada',
    durationEffect: '4 a 8 semanas según el crecimiento y porcentaje de canas',
    nextVisitDays: { min: 30, max: 60 },
    aftercare: [
      {
        phase: 'Primeras 48 horas',
        days: 'Día 1 y 2',
        title: 'Fijación del color',
        tips: [
          'No laves el cabello las primeras 48 horas para que el tinte fije bien',
          'Evita el calor excesivo — planchas y secador al mínimo',
          'No te expongas al sol directo',
          'Evita transpiración excesiva',
        ],
      },
      {
        phase: 'Primera semana',
        days: 'Días 3 al 7',
        title: 'Protección del color',
        tips: [
          'Usa shampoo para cabello teñido (color safe)',
          'Lava con agua fría para cerrar la cutícula y sellar el color',
          'Aplica acondicionador o mascarilla para cabello con color',
        ],
      },
      {
        phase: 'Mantenimiento mensual',
        days: 'Semana 2 en adelante',
        title: 'Preservación del tono',
        tips: [
          'Lava máximo 3 veces por semana',
          'Usa siempre protector térmico antes del calor',
          'Mascarilla para cabello teñido 1x por semana',
          'Evita el sol prolongado sin protector capilar UV',
        ],
      },
    ],
    productsToUse: [
      'Shampoo para cabello teñido (color safe)',
      'Acondicionador protector de color',
      'Mascarilla para cabellos con color',
      'Protector térmico',
    ],
    productsToAvoid: [
      'Shampoo con sulfatos que destiñen',
      'Agua muy caliente al lavar',
      'Exposición solar prolongada sin protección',
    ],
    reminders: [
      {
        daysAfter: 2,
        emoji: '🎨',
        title: '¡Primer lavado hoy!',
        message: 'Han pasado 48 horas, ya puedes lavar. Recuerda usar shampoo para cabello teñido y agua fresca.',
      },
      {
        daysAfter: 30,
        emoji: '🌱',
        title: 'Las raíces están creciendo',
        message: 'Ya pasó un mes. Si tienes canas o quieres mantener el color uniforme, es momento de agendar tu retoque.',
      },
      {
        daysAfter: 55,
        emoji: '💆',
        title: '¡Renueva tu color!',
        message: 'Tu tinte necesita un retoque. Agenda con nosotros para mantener tu color vibrante y uniforme.',
      },
    ],
    proTips: [
      'El agua fría al final del lavado sella la cutícula y hace que el color dure más',
      'Un shampoo sin sulfatos puede duplicar la vida útil de tu tinte',
      'La mascarilla una vez por semana compensa el daño del calor y mantiene el brillo',
    ],
  },
  {
    id: 'alisado',
    name: 'Alisado',
    icon: '〰️',
    tagline: 'Alisado progresivo para un cabello liso y manejable',
    durationEffect: '2 a 4 meses',
    nextVisitDays: { min: 60, max: 120 },
    aftercare: [
      {
        phase: 'Primeras 72 horas',
        days: 'Día 1, 2 y 3',
        title: 'Periodo de fijación',
        tips: [
          'No laves ni mojes el cabello',
          'No lo ates ni coloques pinches',
          'Evita el calor y la humedad ambiental',
          'No hagas ejercicio que genere transpiración',
        ],
        warning: 'El alisado fija en las primeras 72 horas — cualquier onda o marca quedará permanente.',
      },
      {
        phase: 'Semana 1',
        days: 'Día 4 al 7',
        title: 'Primer lavado',
        tips: [
          'Usa shampoo libre de sulfatos',
          'Seca inmediatamente con secador y cepillo en sentido recto',
          'Usa plancha para sellar el alisado después de lavar',
        ],
      },
      {
        phase: 'Mantenimiento',
        days: 'Semana 2 en adelante',
        title: 'Cuidado para prolongar el efecto',
        tips: [
          'Lava máximo 2-3 veces por semana',
          'Siempre seca en línea recta',
          'Mascarilla hidratante 1x por semana',
          'Evita humedad ambiental excesiva sin protección',
        ],
      },
    ],
    productsToUse: [
      'Shampoo libre de sulfatos',
      'Acondicionador hidratante',
      'Mascarilla alisante o nutritiva',
      'Protector térmico',
      'Aceite de argán en puntas',
    ],
    productsToAvoid: [
      'Shampoo con sulfatos o sal',
      'Humedad sin protección',
    ],
    reminders: [
      {
        daysAfter: 3,
        emoji: '🚿',
        title: 'Ya puedes lavar tu cabello',
        message: '¡72 horas cumplidas! Recuerda usar shampoo libre de sulfatos y secar en línea recta para preservar el alisado.',
      },
      {
        daysAfter: 60,
        emoji: '⏰',
        title: 'Mantenimiento del alisado',
        message: 'Tu alisado puede necesitar un toque de mantenimiento. ¡Contáctanos para evaluarlo!',
      },
    ],
    proTips: [
      'Secar bien el cabello después de cada lavado ayuda a prolongar el efecto del alisado',
      'Un aceite liviano en las puntas reduce el frizz y da brillo',
      'Evitar la humedad en los primeros días es la clave para un buen resultado',
    ],
  },
  {
    id: 'botox',
    name: 'Botox capilar',
    icon: '💎',
    tagline: 'Tratamiento de reconstrucción y nutrición profunda sin formaldehído',
    durationEffect: '2 a 3 meses',
    nextVisitDays: { min: 60, max: 90 },
    aftercare: [
      {
        phase: 'Primeras 48 horas',
        days: 'Día 1 y 2',
        title: 'Sellado del tratamiento',
        tips: [
          'No laves el cabello',
          'Evita atar o recoger el cabello',
          'Mantente alejada de la humedad',
        ],
      },
      {
        phase: 'Mantenimiento',
        days: 'Semana 1 en adelante',
        title: 'Nutrición continua',
        tips: [
          'Usa shampoo libre de sulfatos',
          'Mascarilla nutritiva 1x por semana',
          'Protector térmico siempre',
          'El resultado mejora con cada aplicación — planifica sesiones periódicas',
        ],
      },
    ],
    productsToUse: [
      'Shampoo libre de sulfatos',
      'Mascarilla de nutrición profunda',
      'Aceite nutritivo en puntas',
      'Protector térmico',
    ],
    productsToAvoid: [
      'Shampoo con sulfatos agresivos',
    ],
    reminders: [
      {
        daysAfter: 2,
        emoji: '💎',
        title: 'Primer lavado post botox',
        message: 'Usa tu shampoo libre de sulfatos. ¡Notarás el cabello increíblemente suave y brillante!',
      },
      {
        daysAfter: 60,
        emoji: '🔄',
        title: 'Renovar el botox capilar',
        message: 'El efecto del botox empieza a reducirse. Agenda tu próxima sesión para mantener el cabello nutrido.',
      },
    ],
    proTips: [
      'El botox capilar NO contiene formaldehído — es un tratamiento seguro y nutritivo',
      'El efecto mejora y se acumula con aplicaciones periódicas',
      'Perfecto para combinar con coloración — nutre mientras protege el color',
    ],
  },
  {
    id: 'balayage',
    name: 'Mechas / Balayage',
    icon: '🌈',
    tagline: 'Iluminación natural y degradados a mano alzada',
    durationEffect: '3 a 5 meses (el balayage crece de forma muy natural)',
    nextVisitDays: { min: 90, max: 150 },
    aftercare: [
      {
        phase: 'Primeras 48 horas',
        days: 'Día 1 y 2',
        title: 'Fijación del color',
        tips: [
          'No laves las primeras 48 horas',
          'Evita sol directo y calor',
        ],
      },
      {
        phase: 'Mantenimiento',
        days: 'Semana 1 en adelante',
        title: 'Preservación del degradado',
        tips: [
          'Shampoo matizador violeta para puntas si son rubias',
          'Mascarilla nutritiva 2x por semana',
          'Protector UV para cabello en el sol',
          'El balayage tiene retoque fácil — no necesita tanta frecuencia como mechas tradicionales',
        ],
      },
    ],
    productsToUse: [
      'Shampoo matizador violeta (para zonas rubias)',
      'Mascarilla nutritiva e hidratante',
      'Protector térmico',
      'Protector solar capilar',
    ],
    productsToAvoid: [
      'Shampoo con sulfatos',
      'Exceso de sol sin protección capilar',
      'Cloro de piscina sin gorra',
    ],
    reminders: [
      {
        daysAfter: 7,
        emoji: '🌈',
        title: 'Matiza tus mechas',
        message: 'Si tus puntas son rubias, este es el momento ideal para usar el shampoo violeta y mantener el tono frío.',
      },
      {
        daysAfter: 90,
        emoji: '🌟',
        title: '¡Tu balayage sigue hermoso!',
        message: 'El balayage crece de forma muy natural. Agenda con nosotros si quieres agregar luminosidad o refrescar el color.',
      },
      {
        daysAfter: 150,
        emoji: '✨',
        title: 'Tiempo de renovar',
        message: 'Ya es momento de renovar tu balayage. ¡Contáctanos para tu próxima sesión!',
      },
    ],
    proTips: [
      'El balayage crece de forma muy natural — no hay líneas de demarcación evidentes',
      'Un shampoo matizador violeta usado 1x por semana mantiene las mechas frías y brillantes',
      'El sol es el mayor enemigo del cabello rubio — usa siempre protector UV',
    ],
  },
  {
    id: 'corte',
    name: 'Corte',
    icon: '✂️',
    tagline: 'Corte de cabello personalizado según tu tipo y estilo',
    durationEffect: '6 a 8 semanas hasta el siguiente corte',
    nextVisitDays: { min: 42, max: 56 },
    aftercare: [
      {
        phase: 'Mantenimiento',
        days: 'Desde el primer día',
        title: 'Mantener la forma del corte',
        tips: [
          'Usa acondicionador para mantener las puntas hidratadas',
          'Si el corte incluye flequillo o capas, cepilla en la dirección correcta para que tome su forma',
          'Para cortes con textura, usa productos de texturizado ligero',
          'Programa el siguiente corte en 6-8 semanas para mantener la forma',
        ],
      },
    ],
    productsToUse: [
      'Acondicionador nutritivo',
      'Producto de texturizado o peinado según estilo',
      'Protector térmico',
    ],
    productsToAvoid: [
      'Productos pesados que aplanen el corte',
    ],
    reminders: [
      {
        daysAfter: 42,
        emoji: '✂️',
        title: '¡Es hora de tu próximo corte!',
        message: 'Han pasado 6 semanas. Para mantener la forma perfecta de tu corte, agenda tu próxima sesión.',
      },
    ],
    proTips: [
      'Cortar las puntas cada 6-8 semanas elimina las puntas abiertas y el cabello se ve más sano',
      'Secar el cabello en la dirección del corte potencia la forma original',
    ],
  },
];

export function getTreatmentById(id: string): TreatmentInfo | undefined {
  return TREATMENTS.find((t) => t.id === id);
}

export const TREATMENT_NAMES: Record<string, string> = Object.fromEntries(
  TREATMENTS.map((t) => [t.id, t.name])
);
