class DomainValidator {
    constructor(rules) {
        this.rules = rules.map(rule => this.createRegex(rule));
    }

    match(domain) {
        return this.rules.some(rule => rule.test(domain));
    }

    createRegex(rule) {
        const regexString = '^' + rule.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
        return new RegExp(regexString);
    }
}

export default DomainValidator;