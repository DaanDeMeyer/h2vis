import * as _ from "lodash";

export interface FileData {
    name: string;
    ext: string | undefined;
}

export function shortenNameTo(name: string, length: number): string {
    const half = _.floor((length - 3) / 2);

    if (name.length < length) {
        return name;
    }

    return name.substr(0, half) + "..." + name.substr(name.length - half);
}

export function fileExtToColor(file: FileData | undefined): string {
    if (!file) {
        return "white";
    }

    if (!file.ext) {
        return "white";
    }

    const color = fileExtToColorMap[file.ext];

    if (!color) {
        return "white";
    }

    return color;
}

interface FileExtToColorMap {
    [ext: string]: string;
}

export const fileExtToColorMap: FileExtToColorMap = {
    html: "#f46e65",
    css: "#3dbd7d",
    js: "#f78e3d",
    gif: "#948aec",
    jpg: "#f7629e",
    png: "#d9d9d9",
    ico: "#ffce3d",
    svg: "#49a9ee",
    json: "#7a0000",
    woff2: "#00643b"
};

interface ContentTypeToFileExtension {
    [key: string]: string;
}

export const contentTypeToFileExtension: ContentTypeToFileExtension = {
    "application/javascript": "js",
    "application/x-javascript": "js",
    "text/javascript": "js",
    "image/png": "png",
    "image/gif": "gif",
    "application/json": "json",
    "image/jpg": "jpg",
    "text/html": "html",
    "text/css": "css",
    "image/x-icon": "ico",
    "image/svg+xml": "svg",
    "font/woff2": "woff2"
};
