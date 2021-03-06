require('babel-polyfill')

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development']

module.exports = Object.assign({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  apiHost: process.env.APIHOST || 'localhost',
  apiPort: process.env.APIPORT,
  app: {
    title: 'Le Quiz',
    description: 'All the modern best practices in one example.',
    head: {
      titleTemplate: 'Le Quiz: %s',
      meta: [
        { name: 'description', content: 'All the modern best practices in one example.' },
        { charset: 'utf-8' },
        { property: 'og:site_name', content: 'React Redux Example' },
        { property: 'og:image', content: 'https://react-redux.herokuapp.com/logo.jpg' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:title', content: 'React Redux Example' },
        { property: 'og:description', content: 'All the modern best practices in one example.' },
        { property: 'og:card', content: 'summary' },
        { property: 'og:site', content: '@erikras' },
        { property: 'og:creator', content: '@erikras' },
        { property: 'og:image:width', content: '200' },
        { property: 'og:image:height', content: '200' }
      ]
    }
  },
  firebase: {
    apiKey: 'AIzaSyAjJqpidwXN76jWu3w-v9iNEaV2ONme5tQ',
    authDomain: 'quiz-950e3.firebaseapp.com',
    databaseURL: 'https://quiz-950e3.firebaseio.com',
    storageBucket: 'quiz-950e3.appspot.com',
    messagingSenderId: '728110861753',
    enableRedirectHandling: false
  },
  firebasePaths: {
    userProfile: '/users'
  },
  youtubeApiKey: 'AIzaSyApSGrOV_iBZ-VDqQmKucVDNISjHuzT11k&fields'
}, environment)
