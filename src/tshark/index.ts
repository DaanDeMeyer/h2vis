import * as Fs from "fs";
import * as Path from "path";
import * as _ from "lodash";

import { traceFromPcap } from "tshark/traceFromPcap";

function main() {
    let [input, output] = process.argv.slice(2);

    if (!Fs.existsSync(output)) {
        Fs.mkdirSync(output);
    }

    const inputFiles = _.chain(Fs.readdirSync(input))
        .map(file => Path.parse(Path.resolve(process.cwd(), input, file)))
        .filter(path => path.ext === ".pcap" || path.ext === ".pcapng" || path.ext === ".tls")
        .value();

    const grouped = _.zip(
        _.filter(inputFiles, (file, index) => index % 2 === 0),
        _.filter(inputFiles, (file, index) => index % 2 === 1)
    );

    const traces = _.map(grouped, group => {
        const [pcap, tls] = group;
        return traceFromPcap(pcap, tls);
    });

    Promise.all(traces).then(traces => {
        _.forEach(traces, trace => {
            const json = trace.name + ".json";
            Fs.writeFileSync(Path.resolve(output, json), JSON.stringify(trace, null, 2));
        });

        const existing: Array<string> = _.filter(
            Fs.readdirSync(output),
            name => Path.parse(name).ext === ".json" && name !== "index.json"
        );

        const names = _.uniq(_.concat(existing, _.map(traces, trace => trace.name + ".json")));

        const index = Path.resolve(output, "index.json");
        Fs.writeFileSync(index, JSON.stringify(names, null, 2));
    });
}

main();
