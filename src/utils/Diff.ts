interface Difference {
    '='?: string;
    '+'?: string;
    '-'?: string;
}
export function diff(
    oldString: string,
    newString: string,
    splitter = /[ \n]/
): Difference[] {
    oldString = oldString.toString();
    newString = newString.toString();
    const A = oldString.split(splitter);
    const B = newString.split(splitter);
    const N = A.length;
    const M = B.length;
    const MAX = N + M;
    const As = oldString.match(splitter) || [];
    const Bs = newString.match(splitter) || [];

    const steps: [number, number][][] = [];

    const V = [];
    V[1 + MAX] = 0;
    let field = (() => {
        for (let D = 0; D <= MAX; D++) {
            steps[D] = [];
            for (
                let k = -(D - 2 * Math.max(0, D - M));
                k <= D - 2 * Math.max(0, D - N);
                k += 2
            ) {
                let x;
                if (k === -D || (k !== D && V[k - 1 + MAX] < V[k + 1 + MAX])) {
                    x = V[k + 1 + MAX];
                } else {
                    x = V[k - 1 + MAX] + 1;
                }
                let y = x - k;
                while (x < N && y < M && A[x] === B[y]) {
                    x++;
                    y++;
                }
                V[k + MAX] = x;
                steps[D].push([x, y]);
                if (x === N && y === M) {
                    return [x, y];
                }
            }
        }
    })();
    if (!field) return [];
    const reverseCommands = [];
    for (let D = steps.length - 2; D >= 0; D--) {
        const prev = steps[D].filter(f =>
            [-1, 1].includes(
                (field?.[0] ?? 0) - (field?.[1] ?? 0) - (f[0] - f[1])
            )
        ).sort((a, b) => b[0] - a[0])[0];
        const insert = field[0] - field[1] - (prev[0] - prev[1]) === -1;
        const takeLen = insert ? field[0] - prev[0] : field[1] - prev[1];
        const take = A.splice(A.length - takeLen, takeLen)
            .map(t => `${t} ${As.splice(0, 1).join('')}`)
            .join('');
        B.splice(B.length - takeLen, takeLen);
        Bs.splice(0, takeLen);
        if (take.length) reverseCommands.push({ '=': take });
        const before = reverseCommands[reverseCommands.length - 1];
        if (insert) {
            if (before && before.hasOwnProperty('+'))
                before['+'] = `${B.pop()} ${Bs.splice(0, 1).join('')} ${
                    before['+']
                }`;
            else
                reverseCommands.push({
                    '+': B.pop() + Bs.splice(0, 1).join(''),
                });
        } else {
            if (before && before.hasOwnProperty('-'))
                before['-'] = `${A.pop()} ${As.splice(0, 1).join('')} ${
                    before['-']
                }`;
            else
                reverseCommands.push({
                    '-': A.pop() + As.splice(0, 1).join(''),
                });
        }
        field = prev;
    }
    if (A.length)
        reverseCommands.push({
            '=': A.map(t => `${t} ${As.splice(0, 1).join('')}`).join(''),
        });
    return reverseCommands.reverse();
}
export function format(diff: Difference[]): string {
    return (
        '```diff' +
        Object.values(diff)
            .map(c =>
                c.hasOwnProperty('=')
                    ? `\n${c['=']}`
                    : c.hasOwnProperty('+')
                    ? `\n+ ${c['+']?.replace(/\n/g, '\n + ') ?? ''}`
                    : c.hasOwnProperty('-')
                    ? `\n- ${c['-']?.replace(/\n/g, '\n - ') ?? ''}`
                    : ''
            )
            .join('')
            .replace(/`/g, '`​') +
        '\n```'
    );
}
