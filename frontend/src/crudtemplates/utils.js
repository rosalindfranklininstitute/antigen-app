module.exports = {
    toTitleCase: (str) => {
        return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
        );
    },

    pluralise: (str) => {
        // TODO: Make less primitive!
        return (str.endsWith("y")) ? str.slice(0, -1) + "ies" : str + "s";
    }
}