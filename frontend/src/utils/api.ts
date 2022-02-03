export function fromAPI(uriFrag: string) {
    return fetch(`http://127.0.0.1:8000/api/${uriFrag}/?format=json`)
}