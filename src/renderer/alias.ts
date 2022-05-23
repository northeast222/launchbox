const Module = require('module');
const originalRequire = Module.prototype.require;

interface Pattern {
  expr: string | RegExp;
  handler: (expr: string | RegExp, path: string) => string;
}

const requireProcessors: Pattern[] = [];

Module.prototype.require = function () {
  const requirePath = arguments[0];
  const special = requireProcessors.find(ptrn =>
    typeof ptrn.expr === 'string' ? ptrn.expr === requirePath : ptrn.expr.test(requirePath)
  );
  if (special) {
    arguments[0] = special.handler(special.expr, requirePath);
  }
  return originalRequire.apply(this, arguments);
};

export function aliasModule(aliasFrom?: string | RegExp, aliasTo?: string) {
  if (!aliasFrom || !aliasTo) {
    return;
  }
  if (!requireProcessors.find(proc => proc.expr === aliasFrom)) {
    requireProcessors.push({ expr: aliasFrom, handler: () => aliasTo });
  }
}

export function aliasHandle(
  aliasFrom: string | RegExp,
  handler: (expr: string | RegExp, path: string) => string
) {
  if (!requireProcessors.find(proc => proc.expr === aliasFrom)) {  
    requireProcessors.push({ expr: aliasFrom, handler: handler });
  }
}

/*=================================================================================*/

import path from 'path';

export function aliasDefaults() {
  aliasModule('react', 'preact/compat');
  aliasModule('react-dom', 'preact/compat');
}

export default aliasDefaults;
