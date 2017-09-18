# H2Vis

H2Vis is an application that visualizes the inner workings of HTTP/2. (Developed as part of my Bachelor In Computer Science degree at the university of Hasselt)

# Usage

(Testing occurs with latest Nodejs and latest Yarn)

- Make sure Nodejs and NPM/Yarn are installed
- Make sure Wireshark (along with Tshark) is installed
- Execute "npm/yarn install" to install the required dependencies
- Execute "npm/yarn run cli" to compile and build the cli program
- Execute "npm/yarn run website" to compile and build the website
- Build output can be found in the build directory
    - The website is composed of the index.html file and the bundle.js file
    - The command line application is composed of the h2vis-cli.js file

- Process pcap files (with a corresponding TLS keylog file) using h2vis-cli.js
- h2vis-cli.js takes two arguments:
    1. The directory containing all the input files. This directory should contain pcap (tshark trace) and tls (key log) files with matching names
    2. The output directory. The resulting json files will be written to this directory
- For example, to process the test traces in this repository: node build/h2vis-cli.js traces/ traces/

- The H2Vis website looks for the output files produced by h2vis-cli.js in the traces/ directory in the root of the website (next to index.html and bundle.js)

# Development

- To start a local development server which loads traces from the traces/ directory in the root of this repository execute: npm/yarn run dev
- H2Vis can now be accessed at http://localhost:8080/