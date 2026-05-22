export type Locale = 'pt' | 'en';

export const translations = {
  pt: {
    nav: {
      login: 'Entrar',
      register: 'Criar conta',
    },
    hero: {
      badge: 'tapfolio.com/username',
      title: 'Seus links em um só lugar',
      subtitle:
        'Crie sua página personalizada e compartilhe tudo que importa com um único link. Simples, bonito e rápido.',
      cta: 'Começar gratuitamente',
    },
    features: {
      title: 'Tudo que você precisa',
      items: [
        {
          title: 'Link personalizado',
          description:
            'Sua URL única: tapfolio.com/username. Compartilhe nas redes sociais, bio do Instagram ou onde quiser.',
        },
        {
          title: 'Visual customizável',
          description:
            'Escolha cores, estilos de botão e personalize cada detalhe. Deixe sua página com a sua cara.',
        },
        {
          title: 'Analytics em tempo real',
          description:
            'Acompanhe visitantes e cliques para entender o alcance do seu conteúdo e crescer com dados.',
        },
      ],
    },
    cta: {
      title: 'Pronto para começar?',
      subtitle:
        'Crie sua conta gratuitamente e tenha sua página no ar em minutos.',
      button: 'Criar minha página',
    },
    footer: {
      rights: 'Todos os direitos reservados.',
    },
  },
  en: {
    nav: {
      login: 'Sign in',
      register: 'Get started',
    },
    hero: {
      badge: 'tapfolio.com/username',
      title: 'All your links in one place',
      subtitle:
        'Create your personalized page and share everything that matters with a single link. Simple, beautiful and fast.',
      cta: 'Start for free',
    },
    features: {
      title: 'Everything you need',
      items: [
        {
          title: 'Custom link',
          description:
            'Your unique URL: tapfolio.com/username. Share it on social media, your Instagram bio, or anywhere.',
        },
        {
          title: 'Customizable design',
          description:
            'Choose colors, button styles and personalize every detail. Make your page truly yours.',
        },
        {
          title: 'Real-time analytics',
          description:
            'Track visitors and clicks to understand your content reach and grow with data.',
        },
      ],
    },
    cta: {
      title: 'Ready to get started?',
      subtitle:
        'Create your free account and have your page live in minutes.',
      button: 'Create my page',
    },
    footer: {
      rights: 'All rights reserved.',
    },
  },
} as const;
