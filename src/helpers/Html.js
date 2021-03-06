import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom/server'
import serialize from 'serialize-javascript'
import Helmet from 'react-helmet'

/**
 * Wrapper component containing HTML metadata and boilerplate tags.
 * Used in server-side code only to wrap the string output of the
 * rendered route component.
 *
 * The only thing this component doesn't (and can't) include is the
 * HTML doctype declaration, which is added to the rendered output
 * by the server.js file.
 */
export default class Html extends Component {
  static propTypes = {
    assets: PropTypes.object,
    component: PropTypes.node,
    store: PropTypes.object
  }

  render() {
    const { assets, component, store } = this.props
    const content = component ? ReactDOM.renderToString(component) : ''
    const head = Helmet.rewind()

    return (
      <html lang="en-us">
      <head>
        {head.base.toComponent()}
        {head.title.toComponent()}
        {head.meta.toComponent()}
        {head.link.toComponent()}
        {head.script.toComponent()}

        <link rel="shortcut icon" href="/favicon.ico"/>
        <link rel="manifest" href="/manifest.json"/>
        <link rel="apple-touch-icon" href="launcher-icon.png"/>
        <link rel="apple-touch-icon" sizes="152x152" href="launcher-icon-152.png"/>
        <link rel="apple-touch-icon" sizes="180x180" href="launcher-icon-180.png"/>
        <link rel="apple-touch-icon" sizes="167x167" href="launcher-icon-167.png"/>
        <link rel="apple-touch-startup-image" href="launch.png"/>
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700&ampsubset=cyrillic"
              rel="stylesheet"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-title" content="Le Quiz"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"/>
        {/* styles (will be present only in production with webpack extract text plugin) */}
        {Object.keys(assets.styles).map((style, key) =>
          <link href={assets.styles[style]} key={key} media="screen, projection"
                rel="stylesheet" type="text/css" charSet="UTF-8"/>
        )}

        {/* (will be present only in development mode) */}
        {/* outputs a <style/> tag with all bootstrap styles + App.scss + it could be CurrentPage.scss. */}
        {/* can smoothen the initial style flash (flicker) on page load in development mode. */}
        {/* ideally one could also include here the style for the current page (Home.scss, About.scss, etc) */}
        { Object.keys(assets.styles).length === 0 ? <style
          dangerouslySetInnerHTML={{ __html: require('../theme/bootstrap.config.js') + require('../containers/App/App.scss')._style }}/> : null }
      </head>
      <body>
      <div id="content" dangerouslySetInnerHTML={{ __html: content }}/>
      <script dangerouslySetInnerHTML={{ __html: `window.__data=${serialize(store.getState())}` }} charSet="UTF-8"/>
      <script src={assets.javascript.main} charSet="UTF-8"/>
      </body>
      </html>
    )
  }
}
