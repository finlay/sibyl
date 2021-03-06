var html = require('choo/html')
var css = require('sheetify')

var events = require('./events')

css`
  .terminal-white { color: #ddd }
  .terminal-red { color: #ff7b7b }
`

module.exports = mainView

function mainView (state, emit) {
  const formState = state.form
  const form = html`
    <form class="pt5 flex flex-column align-right" onsubmit=${onsubmit}>
      <label class="f4 b" for="address">
        Address
      </label>
      <input type="text"
        class="mt2 pa2 f5 b--black" id="address"
        value=${formState.address}
        onkeyup=${onkeyup}
        placeholder="For example github://octocat/spoon-knife">
      <span class="mt2 lh-copy">
        Run a repository containing a notebook. Is this your first time?
        <button class="bn bg-white pointer pa0 ma0 link underline" onclick=${tryExample}>
          Try an example
        </button>
      </span>
      <label class="f4 b mt3" for="token">
        Beta token
      </label>
      <input type="text"
        class="mt2 pa2 f5 b--black" id="token"
        value=${formState.token}
        onkeyup=${onkeyup}
        placeholder="Token">
      <span class="mt2 lh-copy">
        To run a container during the beta, you need a beta token.
      </span>
      <input type="submit"
        class="mw4 mt4 mh0 bg-white f5 b--black pa2 link pointer"
        value="Run notebook">
    </form>
  `

  return html`
    <body class="sans-serif pb3">
      <main class="flex flex-column mw7 pa3 center">
        <section>
          <h1 class="f1 f-subheadline-ns ma0 pv3">
            Sibyl
          </h1>
          <h2 class="f3 f2-ns ma0 pt3 pt4-ns">
            Run interactive notebooks in the browser
          </h2>
        </section>
        <section class="flex flex-column justify-between content-stretch">
          <section class="w-100">
            ${form}
          </section>
          <section class="cf content-stretch mt3 mt5-ns">
            ${createTerminal(state, emit)}
            ${createSummary(state, emit)}
          </section>
        </section>
      </main>
    </body>
  `

  function onkeyup (e) {
    if (e.key === 'Enter') return onsubmit()
    var id = e.target.id
    var val = e.target.value
    emit('form:update-' + id, val)
  }

  function onsubmit (e) {
    if (e) e.preventDefault()
    emit(events.LAUNCH_NOTEBOOK)
  }

  function tryExample (e) {
    e.preventDefault()
    emit(events.SET_EXAMPLE_NOTEBOOK)
  }
}

function createSummary (state, emit) {
  if (!state.sse.log.length) return html`<div class="fl"></div>`

  var button
  if (state.sse.url) {
    button = html`
      <a href=${state.sse.url}
        class="mh0 pa2 f5 ba bw1 bg-green white b--green link pointer"
        data-no-routing
        target="_blank">
        Open notebook
      </a>
    `
  } else {
    button = html`
      <a class="mh0 bg-gray f5 ba bw1 b--gray pa2 link white">
        Open notebook
      </a>
    `
  }

  return html`
    <div class="fl w-100 w-40-ns pl5-ns mt4 mt0-ns">
      <h2 class="f4 mv2 mt0-ns mb3-ns">
        Progress
      </h2>
      <div class="flex">
        <p class="mv0">
          <b class="f4 f3-ns">${state.sse.stdout}</b>
          <p class="f5 mt2">Lines</p>
        </p>
        <p class="mv0 ml4">
          <b class="f4 f3-ns">${state.sse.stderr}</b>
          <p class="f5 mt2">Errors</p>
        </p>
      </div>
      <div class="mt2 mt3-ns">
        ${button}
      </div>
    </div>
  `
}

function createTerminal (state, emit) {
  if (!state.sse.log.length) return html`<div></div>`

  return html`
    <div class="fl w-100 w-60-ns mt3 mt0-ns">
      <h2 class="f4 mv2 mt0-ns mb3-ns">
        Console
      </h2>
      <div class="bg-black pa3 f6 pre">
        ${state.sse.log.map(function (event) {
          var className
          if (event.type === 'stdout') className = 'terminal-white'
          else if (event.type === 'stderr') className = 'terminal-red'
          return html`
            <pre class="${className} ma0 lh-copy">
              ${event.data}
            </pre>`
        })}
      </div>
    </div>
  `
}
