import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { useStrict } from "mobx";
import { normalize, setupPage } from "csstips";
import { cssRule, forceRenderStyles } from "typestyle";
import { percent } from "csx";

import { Trace } from "data-format";
import { App } from "website/components/App";
import { AppState } from "website/components/App/state";

useStrict(true);

const state = new AppState([]);

// const context = require.context("../../traces", false, /\.json$/);
// const traces = context.keys().filter(id => id != "./index.json").map(id => context<Trace>(id));
// state.addTraces(traces)

fetchTraces().then(traces => state.addTraces(traces));

normalize();
setupPage("#root");

cssRule("html", {
    fontSize: percent(80)
});

ReactDOM.render(<App state={state} />, document.getElementById("root"));
forceRenderStyles();

function fetchTraces(): Promise<Array<Trace>> {
    return fetch("/traces/index.json")
        .then(response => response.json())
        .then((traceNames: Array<string>) => {
            const traces = _.map(traceNames, name => fetch("/traces/" + name));
            return Promise.all(traces);
        })
        .then(traceResponses => Promise.all(_.map(traceResponses, response => response.json())));
}