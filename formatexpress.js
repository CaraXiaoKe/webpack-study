const tokenTypes = {
    WHITESPACE: 1,
    STRING_LITERAL: 2,
    PARENTHESES: 3,
    GENERAL: 4,
    LOGIC: 5,
    BIT: 6,
};
const tokenDefs = [
    {
        regex: /^\s+/,
        type: tokenTypes.WHITESPACE,
    },
    {
        regex: /^"(?:\\.|[^"])*"|^'(?:\\.|[^'])*'/,
        type: tokenTypes.STRING_LITERAL,
    },
    {
        regex: /^&&|^\|\|/,
        type: tokenTypes.LOGIC,
    },
    {
        regex: /^&|^\|/,
        type: tokenTypes.BIT,
    },
    {
        regex: /^\(|^\)/,
        type: tokenTypes.PARENTHESES,
    },
    {
        regex: /^[^\s&|()'"]+/,
        type: tokenTypes.GENERAL,
    },
];

function createIndent(size) {
    return Array(size)
      .fill(' ')
      .join('');
}

export default function format(sc) {
    let input = sc.substr();
    const tokens = [];
    do {
        for (let i = 0; i < tokenDefs.length; i++) {
            const match = tokenDefs[i].regex.exec(input);
            if (match) {
                if (tokenDefs[i].type !== tokenTypes.WHITESPACE) {
                    tokens.push({
                        type: tokenDefs[i].type,
                        value: match[0],
                    });
                }
                input = input.substring(match[0].length);
                break;
            }
        }
    } while (input.length > 0);
    let result = '';
    let curIndent = 0;
    const stack = [];
    let funcCount = 0;
    for (let i = 0; i < tokens.length; i++) {
        const { type, value } = tokens[i];
        switch (type) {
        case tokenTypes.GENERAL:
            if (tokens[i + 1] && tokens[i + 1].type === tokenTypes.PARENTHESES && tokens[i + 1].value === '(') {
                result += `${value}`;
            } else {
                result += `${value} `;
            }
            break;
        case tokenTypes.STRING_LITERAL:
            result += value;
            break;
        case tokenTypes.BIT:
            result += `${value} `;
            break;
        case tokenTypes.LOGIC:
            result += '\n';
            result += createIndent(curIndent);
            result += `${value} `;
            break;
        case tokenTypes.PARENTHESES:
            if (value === '(') {
                if (i > 0 && tokens[i - 1].type === tokenTypes.GENERAL && stack.slice(-1)[0] !== 'function') {
                  // treat as function;
                    stack.push('function');
                    result += '( ';
                    funcCount++;
                } else if (i > 0 && tokens[i - 1].type === tokenTypes.PARENTHESES && tokens[i - 1].value === '(' && funcCount === 0) {
                    stack.push('parenthese');
                      // result += createIndent(curIndent);
                    result += '(\n';
                    curIndent += 2;
                    result += createIndent(curIndent);
                } else if (stack.slice(-1)[0] === 'function') {
                    funcCount++;
                    result += '(';
                } else {
                    stack.push('other');
                    curIndent += 2;
                    result += '(\n';
                    result += createIndent(curIndent);
                }
            } else {
                const isFunc = stack.slice(-1)[0] === 'function';
                if (isFunc) {
                    funcCount--;
                    if (funcCount === 0) {
                        stack.pop();
                    }
                    result += ' )';
                } else {
                    curIndent -= 2;
                    result += '\n';
                    result += createIndent(curIndent);
                    result += ')';
                }
            }
            break;
        default:
            result += value;
            break;
        }
    }
    return result;
}
