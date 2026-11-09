// Generates game content for all languages into content/games/<lang>/<type>.json
// Types: code-puzzle, bug-hunter, match-pairs, fill-blank
// Run: npx tsx scripts/generate-games.ts
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'content');
const LANGS = fs.readdirSync(path.join(ROOT, 'languages')).filter((d) =>
  fs.existsSync(path.join(ROOT, 'languages', d, 'courses', 'complete-course'))
);

// Keywords used for fill-blank answers and bug mutations, per language.
const KEYWORDS: Record<string, string[]> = {
  python: ['def', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'class', 'try', 'except', 'with', 'lambda', 'print', 'len', 'range', 'self', 'None', 'True', 'False', 'and', 'or', 'not', 'in', 'is', 'pass', 'break', 'continue', 'yield', 'global'],
  javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'class', 'try', 'catch', 'async', 'await', 'new', 'this', 'typeof', 'null', 'undefined', 'true', 'false', 'switch', 'case', 'break', 'continue', 'push', 'map', 'filter'],
  typescript: ['function', 'const', 'let', 'interface', 'type', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'class', 'extends', 'implements', 'try', 'catch', 'async', 'await', 'new', 'this', 'typeof', 'null', 'undefined', 'true', 'false', 'switch', 'case', 'break', 'continue', 'readonly', 'enum'],
  java: ['public', 'private', 'class', 'interface', 'extends', 'implements', 'static', 'final', 'void', 'int', 'String', 'if', 'else', 'for', 'while', 'return', 'new', 'this', 'try', 'catch', 'throw', 'throws', 'import', 'package', 'null', 'true', 'false', 'switch', 'case', 'break', 'continue'],
  c: ['int', 'char', 'float', 'double', 'void', 'if', 'else', 'for', 'while', 'do', 'return', 'struct', 'typedef', 'enum', 'switch', 'case', 'break', 'continue', 'sizeof', 'static', 'const', 'unsigned', 'long', 'short', 'NULL', 'true', 'false', 'goto', 'include', 'define'],
  cpp: ['int', 'char', 'float', 'double', 'void', 'bool', 'class', 'struct', 'namespace', 'template', 'typename', 'public', 'private', 'protected', 'virtual', 'override', 'new', 'delete', 'this', 'if', 'else', 'for', 'while', 'return', 'try', 'catch', 'throw', 'const', 'static', 'nullptr', 'true', 'false', 'using', 'include'],
  csharp: ['public', 'private', 'protected', 'internal', 'class', 'interface', 'struct', 'enum', 'void', 'int', 'string', 'bool', 'var', 'if', 'else', 'for', 'foreach', 'while', 'return', 'new', 'this', 'static', 'readonly', 'const', 'try', 'catch', 'finally', 'throw', 'using', 'namespace', 'null', 'true', 'false', 'async', 'await', 'override', 'virtual'],
  go: ['func', 'package', 'import', 'var', 'const', 'type', 'struct', 'interface', 'map', 'chan', 'goroutine', 'go', 'defer', 'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'select', 'nil', 'true', 'false', 'make', 'new', 'append', 'len', 'cap', 'error', 'string', 'int'],
  rust: ['fn', 'let', 'mut', 'const', 'static', 'struct', 'enum', 'impl', 'trait', 'pub', 'use', 'mod', 'crate', 'self', 'Self', 'if', 'else', 'match', 'for', 'while', 'loop', 'return', 'break', 'continue', 'move', 'ref', 'where', 'async', 'await', 'unsafe', 'dyn', 'impl', 'Some', 'None', 'Ok', 'Err', 'true', 'false', 'String', 'Vec', 'Option', 'Result'],
  php: ['<?php', 'function', 'class', 'public', 'private', 'protected', 'static', 'echo', 'print', 'if', 'else', 'elseif', 'for', 'foreach', 'while', 'do', 'return', 'new', 'this', '$this', 'try', 'catch', 'throw', 'use', 'namespace', 'require', 'include', 'array', 'null', 'true', 'false', 'extends', 'implements', 'interface', 'trait', 'const', 'final'],
  ruby: ['def', 'end', 'class', 'module', 'include', 'extend', 'attr_accessor', 'attr_reader', 'attr_writer', 'if', 'elsif', 'else', 'unless', 'case', 'when', 'for', 'while', 'until', 'do', 'return', 'yield', 'lambda', 'proc', 'lambda', 'self', 'nil', 'true', 'false', 'require', 'require_relative', 'puts', 'gets', 'each', 'map', 'select', 'reject', 'super', 'begin', 'rescue', 'ensure'],
  swift: ['func', 'var', 'let', 'class', 'struct', 'enum', 'protocol', 'extension', 'init', 'deinit', 'self', 'super', 'if', 'else', 'guard', 'switch', 'case', 'for', 'while', 'repeat', 'return', 'break', 'continue', 'try', 'catch', 'throw', 'throws', 'async', 'await', 'import', 'public', 'private', 'internal', 'static', 'let', 'nil', 'true', 'false', 'Some', 'None'],
  kotlin: ['fun', 'val', 'var', 'class', 'object', 'interface', 'data', 'sealed', 'enum', 'companion', 'init', 'this', 'super', 'if', 'else', 'when', 'for', 'while', 'do', 'return', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'throws', 'suspend', 'import', 'package', 'public', 'private', 'internal', 'protected', 'open', 'override', 'abstract', 'null', 'true', 'false', 'is', 'in', 'as', 'by', 'lazy', 'lateinit', 'inline', 'reified', 'out', 'in', 'vararg', 'it', 'also', 'apply', 'let', 'run', 'with', 'repeat', 'sequence'],
  r: ['function', 'if', 'else', 'for', 'while', 'repeat', 'return', 'break', 'next', 'library', 'require', 'source', 'c', 'data.frame', 'list', 'vector', 'matrix', 'array', 'factor', 'TRUE', 'FALSE', 'NULL', 'NA', 'NaN', 'Inf', 'print', 'cat', 'plot', 'summary', 'str', 'names', 'nrow', 'ncol', 'dim', 'length', 'seq', 'cbind', 'rbind', 'subset', 'aggregate', 'tapply', 'by', 'with', 'within', 'attach', 'detach', 'set.seed', 'sample', 'runif', 'rnorm', 'dnorm', 'pnorm', 'qnorm', 'lm', 'glm', 'predict', 'summary.lm', 'anova', 'cor', 'cov', 'sd', 'var', 'mean', 'median', 'min', 'max', 'sum', 'prod', 'cumsum', 'cumprod', 'diff', 'abs', 'sqrt', 'exp', 'log', 'sin', 'cos', 'tan', 'round', 'floor', 'ceiling', 'trunc', 'signif', 'paste', 'paste0', 'sprintf', 'format', 'formatC', 'nchar', 'substr', 'grep', 'grepl', 'regexpr', 'sub', 'gsub', 'strsplit', 'tolower', 'toupper', 'chartr', 'trimws', 'nchar', 'which', 'which.max', 'which.min', 'order', 'sort', 'rank', 'unique', 'duplicated', 'table', 'prop.table', 'margin.table', 'ftable', 'xtabs', 'tapply', 'aggregate', 'by', 'ave', 'transform', 'within', 'subset', 'merge', 'match', 'pmatch', 'charmatch', 'expand.grid', 'interaction', 'split', 'unsplit', 'stack', 'unstack', 'reshape', 'melt', 'cast', 'dcast', 'acast', 'lapply', 'sapply', 'vapply', 'mapply', 'apply', 'tapply', 'sweep', 'scale', 'sweep', 'outer', 'kronecker', 'tcrossprod', 'crossprod', 'solve', 'eigen', 'svd', 'qr', 'chol', 'det', 'rank', 'kappa', 'rcond', 'convolve', 'fft', 'filter', 'embed', 'lag', 'diff', 'cumsum', 'cumprod', 'cummax', 'cummin', 'pmin', 'pmax', 'rowSums', 'colSums', 'rowMeans', 'colMeans', 'rowVars', 'colVars', 'rowProds', 'colProds', 'rowRanks', 'colRanks', 'rowOrder', 'colOrder', 'any', 'all', 'anyNA', 'is.na', 'is.nan', 'is.null', 'is.finite', 'is.infinite', 'is.logical', 'is.numeric', 'is.character', 'is.factor', 'is.data.frame', 'is.matrix', 'is.array', 'is.list', 'is.function', 'is.environment', 'is.object', 'typeof', 'mode', 'class', 'unclass', 'attributes', 'attr', 'attributes<-', 'names', 'dimnames', 'dim<-', 'length', 'length<-', 'levels', 'levels<-', 'contrasts', 'contrasts<-', 'row.names', 'row.names<-', 'colnames', 'colnames<-', 'rownames', 'rownames<-', 'levels', 'nlevels', 'unclass', 'oldClass', 'oldClass<-', 'methods', 'UseMethod', 'NextMethod', 'Recall', 'standardGeneric', 'setGeneric', 'setMethod', 'setClass', 'setRefClass', 'setGroupGeneric', 'setIs', 'setAs', 'setOldClass', 'new.env', 'parent.env', 'environment', 'environment<-', 'get', 'get0', 'exists', 'remove', 'rm', 'ls', 'objects', 'attach', 'detach', 'search', 'loadedNamespaces', 'require', 'library', 'requireNamespace', 'loadNamespace', 'unloadNamespace', 'find.package', 'find.class', 'find.methods', 'apropos', 'args', 'body', 'body<-', 'formals', 'formals<-', 'environment', 'environment<-', 'srcref', 'srcfile', 'sys.function', 'sys.parent', 'parent.frame', 'sys.frames', 'sys.nframe', 'match.call', 'match.arg', 'match.fun', 'match.call', 'deparse', 'dput', 'dump', 'source', 'sys.source', 'parse', 'parse.text', 'parse.file', 'deparse', 'deparse1', 'bquote', 'substitute', 'quote', 'eval', 'evalq', 'eval.parent', 'local', 'with', 'within', 'transform', 'within', 'subset', 'transform', 'within', 'subset'],
  dart: ['void', 'int', 'double', 'num', 'String', 'bool', 'var', 'final', 'const', 'dynamic', 'class', 'abstract', 'extends', 'implements', 'mixin', 'enum', 'if', 'else', 'for', 'while', 'do', 'return', 'break', 'continue', 'switch', 'case', 'default', 'try', 'catch', 'finally', 'throw', 'rethrow', 'async', 'await', 'yield', 'yield*', 'new', 'this', 'super', 'import', 'export', 'library', 'part', 'of', 'static', 'late', 'required', 'covariant', 'factory', 'external', 'operator', 'get', 'set', 'true', 'false', 'null', 'is', 'as', 'in', 'extends', 'with', 'show', 'hide', 'on', 'sync', 'async', 'await', 'Future', 'Stream', 'List', 'Map', 'Set', 'Iterable', 'print', 'assert', 'typedef', 'extension', 'on', 'sealed', 'base', 'interface', 'final', 'mixin', 'record', 'pattern', 'when', 'if-case'],
  bash: ['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'function', 'return', 'break', 'continue', 'local', 'export', 'readonly', 'declare', 'typeset', 'unset', 'shift', 'set', 'echo', 'printf', 'read', 'test', '[', '[[', ']', ']]', 'cd', 'pwd', 'ls', 'cp', 'mv', 'rm', 'mkdir', 'rmdir', 'cat', 'grep', 'sed', 'awk', 'find', 'xargs', 'sort', 'uniq', 'wc', 'head', 'tail', 'diff', 'patch', 'tar', 'gzip', 'gunzip', 'zip', 'unzip', 'curl', 'wget', 'ssh', 'scp', 'rsync', 'chmod', 'chown', 'ln', 'touch', 'du', 'df', 'ps', 'kill', 'top', 'htop', 'man', 'which', 'whereis', 'type', 'alias', 'unalias', 'source', '.', 'exec', 'eval', 'trap', 'wait', 'jobs', 'fg', 'bg', 'nohup', 'sudo', 'su', 'useradd', 'passwd', 'crontab', 'date', 'cal', 'hostname', 'uname', 'uptime', 'free', 'vmstat', 'iostat', 'netstat', 'ss', 'ping', 'traceroute', 'nslookup', 'dig', 'host', 'ifconfig', 'ip', 'route', 'arp', 'iptables', 'ufw', 'systemctl', 'service', 'journalctl', 'dmesg', 'history', 'clear', 'exit', 'logout', 'env', 'printenv', 'setenv', 'export', 'PATH', 'HOME', 'USER', 'SHELL', 'PWD', 'OLDPWD', 'HOSTNAME', 'LANG', 'LC_ALL', 'TERM', 'EDITOR', 'VISUAL', 'PAGER', 'MANPATH', 'INFOPATH', 'LD_LIBRARY_PATH', 'PYTHONPATH', 'NODE_PATH', 'GOPATH', 'JAVA_HOME', 'ANDROID_HOME', 'FLUTTER_ROOT', 'CARGO_HOME', 'RUSTUP_HOME', 'NPM_CONFIG_PREFIX', 'YARN_GLOBAL_FOLDER', 'PNPM_HOME', 'BUN_INSTALL', 'DENO_DIR', 'CONDA_PREFIX', 'VIRTUAL_ENV', 'POETRY_HOME', 'PIPENV_VENV_IN_PROJECT', 'NVM_DIR', 'SDKMAN_DIR', 'ASDF_DATA_DIR', 'MISE_DATA_DIR', 'STARSHIP_SESSION_KEY', 'POWERLEVEL9K_DISABLE_CONFIGURATION_WIZARD', 'ZSH', 'BASH_VERSION', 'ZSH_VERSION', 'FISH_VERSION', 'SHLVL', '_', 'UID', 'EUID', 'GID', 'EGID', 'PPID', 'PID', 'RANDOM', 'SECONDS', 'LINENO', 'FUNCNAME', 'BASH_LINENO', 'BASH_SOURCE', 'BASH_SUBSHELL', 'BASH_ARGC', 'BASH_ARGV', 'BASH_CMDS', 'BASH_ALIASES', 'BASH_COMPLETION', 'BASH_COMPAT', 'BASH_ENV', 'BASH_EXECUTION_STRING', 'BASH_LINENO', 'BASH_LOADABLES_PATH', 'BASH_OPTS', 'BASH_REMATCH', 'BASH_SOURCE', 'BASH_VERSINFO', 'BASH_XTRACEFD', 'COPROC', 'DIRSTACK', 'EPOCHREALTIME', 'EPOCHSECONDS', 'GROUPS', 'HOSTNAME', 'HOSTTYPE', 'IFS', 'MACHTYPE', 'MAPFILE', 'OPTARG', 'OPTERR', 'OPTIND', 'OSTYPE', 'PIPESTATUS', 'PPID', 'PS4', 'PWD', 'SHELLOPTS', 'SRANDOM', 'TIMEFORMAT', 'UID', 'EUID', 'GID', 'EGID', 'BASHPID', 'COMP_WORDBREAKS', 'COMP_LINE', 'COMP_POINT', 'COMP_TYPE', 'COMP_KEY', 'COMP_CWORD', 'COMP_WORDS', 'COMPREPLY', 'DIRSTACK', 'EPOCHREALTIME', 'EPOCHSECONDS', 'FUNCNAME', 'GROUPS', 'HOSTNAME', 'HOSTTYPE', 'IFS', 'LINENO', 'MACHTYPE', 'MAPFILE', 'OPTARG', 'OPTERR', 'OPTIND', 'OSTYPE', 'PIPESTATUS', 'PPID', 'PS4', 'PWD', 'RANDOM', 'SECONDS', 'SHELLOPTS', 'SHLVL', 'SRANDOM', 'TIMEFORMAT', 'UID', 'EUID', 'GID', 'EGID', 'BASHPID', 'COMP_WORDBREAKS', 'COMP_LINE', 'COMP_POINT', 'COMP_TYPE', 'COMP_KEY', 'COMP_CWORD', 'COMP_WORDS', 'COMPREPLY', 'BASH_ARGC', 'BASH_ARGV', 'BASH_CMDS', 'BASH_ALIASES', 'BASH_COMPLETION', 'BASH_COMPAT', 'BASH_ENV', 'BASH_EXECUTION_STRING', 'BASH_LINENO', 'BASH_LOADABLES_PATH', 'BASH_OPTS', 'BASH_REMATCH', 'BASH_SOURCE', 'BASH_SUBSHELL', 'BASH_VERSINFO', 'BASH_XTRACEFD', 'COPROC', 'DIRSTACK', 'EPOCHREALTIME', 'EPOCHSECONDS', 'FUNCNAME', 'GROUPS', 'HOSTNAME', 'HOSTTYPE', 'IFS', 'LINENO', 'MACHTYPE', 'MAPFILE', 'OPTARG', 'OPTERR', 'OPTIND', 'OSTYPE', 'PIPESTATUS', 'PPID', 'PS4', 'PWD', 'RANDOM', 'SECONDS', 'SHELLOPTS', 'SHLVL', 'SRANDOM', 'TIMEFORMAT', 'UID', 'EUID', 'GID', 'EGID', 'BASHPID', 'COMP_WORDBREAKS', 'COMP_LINE', 'COMP_POINT', 'COMP_TYPE', 'COMP_KEY', 'COMP_CWORD', 'COMP_WORDS', 'COMPREPLY'],
  assembly: ['mov', 'add', 'sub', 'mul', 'div', 'push', 'pop', 'call', 'ret', 'jmp', 'je', 'jne', 'jg', 'jl', 'jge', 'jle', 'ja', 'jb', 'jae', 'jbe', 'jo', 'jno', 'js', 'jns', 'jp', 'jnp', 'loop', 'cmp', 'test', 'and', 'or', 'xor', 'not', 'neg', 'inc', 'dec', 'shl', 'shr', 'sar', 'rol', 'ror', 'nop', 'int', 'syscall', 'sysenter', 'leave', 'enter', 'rep', 'repe', 'repne', 'movsb', 'movsw', 'movsd', 'movsq', 'stosb', 'stosw', 'stosd', 'stosq', 'lodsb', 'lodsw', 'lodsd', 'lodsq', 'scasb', 'scasw', 'scasd', 'scasq', 'cmpsb', 'cmpsw', 'cmpsd', 'cmpsq', 'xchg', 'lea', 'nop', 'hlt', 'cli', 'sti', 'cld', 'std', 'cdq', 'cwd', 'cqo', 'cbw', 'cwde', 'cdqe', 'movzx', 'movsx', 'bswap', 'xadd', 'cmpxchg', 'lock', 'pause', 'lfence', 'mfence', 'sfence', 'prefetch', 'clflush', 'invlpg', 'wbinvd', 'invd', 'rdtsc', 'rdtscp', 'cpuid', 'xgetbv', 'xsetbv', 'rdrand', 'rdseed', 'vmcall', 'vmlaunch', 'vmresume', 'vmxoff', 'invept', 'invvpid', 'vmfunc', 'vmclear', 'vmptrld', 'vmptrst', 'vmread', 'vmwrite', 'invept', 'invvpid', 'vmfunc'],
  sql: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'ADD', 'COLUMN', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'NOT', 'NULL', 'UNIQUE', 'DEFAULT', 'CHECK', 'CONSTRAINT', 'INDEX', 'VIEW', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS', 'ON', 'USING', 'AS', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'DISTINCT', 'ALL', 'ANY', 'SOME', 'UNION', 'INTERSECT', 'EXCEPT', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'ASC', 'DESC', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF', 'CAST', 'CONVERT', 'SUBSTRING', 'TRIM', 'UPPER', 'LOWER', 'LENGTH', 'CONCAT', 'REPLACE', 'ROUND', 'ABS', 'FLOOR', 'CEILING', 'NOW', 'CURRENT_DATE', 'CURRENT_TIMESTAMP', 'DATE', 'TIME', 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND', 'WITH', 'RECURSIVE', 'OVER', 'PARTITION', 'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE', 'NTH_VALUE', 'NTILE', 'CUME_DIST', 'PERCENT_RANK', 'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'SAVEPOINT', 'GRANT', 'REVOKE', 'TO', 'WITH', 'GRANT', 'OPTION', 'CASCADE', 'RESTRICT', 'EXPLAIN', 'ANALYZE', 'VERBOSE', 'TRUNCATE', 'COMMENT', 'ON', 'LOCK', 'TABLE', 'UNLOCK', 'TABLES', 'DATABASES', 'SCHEMAS', 'USERS', 'PRIVILEGES', 'IDENTIFIED', 'BY', 'PASSWORD', 'EXPIRE', 'ACCOUNT', 'UNLOCK', 'GRANT', 'OPTION', 'WITH', 'GRANT', 'OPTION', 'MAX_QUERIES_PER_HOUR', 'MAX_UPDATES_PER_HOUR', 'MAX_CONNECTIONS_PER_HOUR', 'MAX_USER_CONNECTIONS', 'REQUIRE', 'SSL', 'X509', 'ISSUER', 'SUBJECT', 'CIPHER', 'MAX_STATEMENT_TIME', 'MAX_EXECUTION_TIME', 'INNODB', 'DEADLOCK', 'LOCK', 'WAIT', 'TIMEOUT', 'NOWAIT', 'SKIP', 'LOCKED', 'FOR', 'UPDATE', 'SHARE', 'MODE', 'READ', 'WRITE', 'CONSISTENT', 'SNAPSHOT', 'REPEATABLE', 'SERIALIZABLE', 'READ', 'COMMITTED', 'READ', 'UNCOMMITTED', 'AUTOCOMMIT', 'ISOLATION', 'LEVEL', 'SESSION', 'GLOBAL', 'LOCAL', 'VARIABLE', 'SET', 'SHOW', 'VARIABLES', 'SHOW', 'STATUS', 'SHOW', 'PROCESSLIST', 'KILL', 'SHOW', 'ENGINE', 'INNODB', 'STATUS', 'CHECK', 'TABLE', 'OPTIMIZE', 'TABLE', 'ANALYZE', 'TABLE', 'REPAIR', 'TABLE', 'RENAME', 'TABLE', 'TO', 'ALTER', 'TABLE', 'CHANGE', 'COLUMN', 'MODIFY', 'COLUMN', 'DROP', 'COLUMN', 'ADD', 'COLUMN', 'ADD', 'INDEX', 'DROP', 'INDEX', 'ADD', 'CONSTRAINT', 'DROP', 'CONSTRAINT', 'ADD', 'FOREIGN', 'KEY', 'DROP', 'FOREIGN', 'KEY', 'ADD', 'PRIMARY', 'KEY', 'DROP', 'PRIMARY', 'KEY', 'ADD', 'UNIQUE', 'DROP', 'UNIQUE', 'ADD', 'CHECK', 'DROP', 'CHECK', 'ENABLE', 'DISABLE', 'KEYS', 'VALIDATE', 'CONSTRAINT', 'NO', 'VALIDATE', 'CONSTRAINT', 'INVISIBLE', 'VISIBLE', 'INDEX', 'VISIBLE', 'INDEX', 'INVISIBLE', 'ALTER', 'ALGORITHM', 'LOCK', 'NONE', 'SHARED', 'EXCLUSIVE', 'INPLACE', 'COPY', 'INSTANT', 'ADD', 'DROP', 'COLUMN', 'ADD', 'INDEX', 'DROP', 'INDEX', 'ALGORITHM', 'LOCK', 'NONE', 'SHARED', 'EXCLUSIVE', 'INPLACE', 'COPY', 'INSTANT'],
  html: ['<!DOCTYPE', 'html', 'head', 'body', 'title', 'meta', 'link', 'style', 'script', 'div', 'span', 'p', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'form', 'input', 'button', 'select', 'option', 'textarea', 'label', 'fieldset', 'legend', 'header', 'footer', 'nav', 'main', 'section', 'article', 'aside', 'figure', 'figcaption', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'b', 'i', 'u', 's', 'small', 'mark', 'del', 'ins', 'sub', 'sup', 'br', 'hr', 'pre', 'code', 'kbd', 'samp', 'var', 'time', 'data', 'abbr', 'address', 'blockquote', 'q', 'cite', 'dfn', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'wbr', 'details', 'summary', 'dialog', 'menu', 'menuitem', 'search', 'hgroup', 'slot', 'template', 'canvas', 'svg', 'math', 'video', 'audio', 'source', 'track', 'embed', 'object', 'param', 'iframe', 'picture', 'map', 'area', 'base', 'noscript', 'iframe', 'portal', 'fencedframe', 'selectedcontent', 'permission', 'geolocation', 'accelerometer', 'gyroscope', 'magnetometer', 'ambient-light-sensor', 'bluetooth', 'usb', 'serial', 'hid', 'midi', 'nfc', 'payment', 'camera', 'microphone', 'speaker', 'display-capture', 'window-management', 'document-picture-in-picture', 'local-fonts', 'compute-pressure', 'interest-cohort', 'attribution-reporting', 'shared-storage', 'protected-audience', 'private-aggregation', 'private-state-token', 'trust-tokens', 'fledge', 'turtledove', 'topics', 'browsing-topics', 'attribution-reporting', 'shared-storage', 'protected-audience', 'private-aggregation', 'private-state-token', 'trust-tokens', 'fledge', 'turtledove', 'topics', 'browsing-topics'],
  css: ['color', 'background', 'background-color', 'background-image', 'background-position', 'background-size', 'background-repeat', 'background-attachment', 'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant', 'line-height', 'letter-spacing', 'word-spacing', 'text-align', 'text-decoration', 'text-transform', 'text-indent', 'text-shadow', 'white-space', 'word-break', 'overflow-wrap', 'hyphens', 'direction', 'unicode-bidi', 'writing-mode', 'text-orientation', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'border', 'border-width', 'border-style', 'border-color', 'border-top', 'border-right', 'border-bottom', 'border-left', 'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius', 'outline', 'outline-width', 'outline-style', 'outline-color', 'outline-offset', 'box-shadow', 'box-sizing', 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'float', 'clear', 'overflow', 'overflow-x', 'overflow-y', 'overflow-wrap', 'visibility', 'opacity', 'transform', 'transform-origin', 'transition', 'transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay', 'animation', 'animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay', 'animation-iteration-count', 'animation-direction', 'animation-fill-mode', 'animation-play-state', 'cursor', 'pointer-events', 'user-select', 'resize', 'scroll-behavior', 'scroll-snap-type', 'scroll-snap-align', 'scroll-margin', 'scroll-padding', 'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content', 'align-items', 'align-content', 'align-self', 'order', 'flex-grow', 'flex-shrink', 'flex-basis', 'gap', 'row-gap', 'column-gap', 'grid', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas', 'grid-column', 'grid-row', 'grid-area', 'grid-auto-columns', 'grid-auto-rows', 'grid-auto-flow', 'justify-items', 'align-items', 'justify-self', 'align-self', 'place-items', 'place-content', 'place-self', 'filter', 'backdrop-filter', 'mix-blend-mode', 'isolation', 'clip-path', 'mask', 'mask-image', 'mask-mode', 'mask-repeat', 'mask-position', 'mask-size', 'mask-clip', 'mask-origin', 'mask-composite', 'object-fit', 'object-position', 'aspect-ratio', 'contain', 'content-visibility', 'container-type', 'container-name', 'perspective', 'perspective-origin', 'backface-visibility', 'will-change', 'contain-intrinsic-size', 'interpolate-size', 'timeline-scope', 'view-timeline-name', 'view-timeline-axis', 'animation-timeline', 'animation-range', 'scroll-timeline-name', 'scroll-timeline-axis', '@keyframes', '@media', '@supports', '@container', '@layer', '@scope', '@starting-style', '@font-face', '@import', '@charset', '@namespace', '@page', '@counter-style', '@property', '@viewport', '@document', '@-moz-document', '@-webkit-keyframes', '@-o-keyframes', '@-ms-keyframes', ':root', ':host', ':host-context', ':is', ':where', ':has', ':not', ':nth-child', ':nth-of-type', ':nth-last-child', ':nth-last-of-type', ':first-child', ':last-child', ':only-child', ':only-of-type', ':empty', ':root', ':target', ':enabled', ':disabled', ':checked', ':indeterminate', ':required', ':optional', ':valid', ':invalid', ':in-range', ':out-of-range', ':read-only', ':read-write', ':placeholder-shown', ':autofill', ':default', ':defined', ':focus', ':focus-visible', ':focus-within', ':hover', ':active', ':visited', ':link', ':any-link', ':local-link', ':target-within', ':target-current', ':past', ':future', ':playing', ':paused', ':seeking', ':buffering', ':stalled', ':muted', ':volume-locked', ':open', ':closed', ':modal', ':fullscreen', ':picture-in-picture', ':popover-open', ':user-valid', ':user-invalid', ':dir', ':lang', ':state', ':host', ':host-context', '::before', '::after', '::first-letter', '::first-line', '::marker', '::selection', '::placeholder', '::backdrop', '::file-selector-button', '::cue', '::part', '::slotted', '::view-transition', '::view-transition-group', '::view-transition-image-pair', '::view-transition-old', '::view-transition-new', 'var', 'env', 'attr', 'calc', 'clamp', 'min', 'max', 'round', 'mod', 'rem', 'abs', 'sign', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'pow', 'sqrt', 'hypot', 'log', 'exp', 'linear-gradient', 'radial-gradient', 'conic-gradient', 'repeating-linear-gradient', 'repeating-radial-gradient', 'repeating-conic-gradient', 'url', 'image-set', 'cross-fade', 'element', 'paint', 'counter', 'counters', 'symbols', 'leader', 'target-counter', 'target-counters', 'target-text', 'string-set', 'content', 'quotes', 'counter-reset', 'counter-increment', 'counter-set', 'list-style', 'list-style-type', 'list-style-position', 'list-style-image', 'marker', 'bookmark-level', 'bookmark-label', 'bookmark-state', 'bookmark-target', 'break-before', 'break-after', 'break-inside', 'orphans', 'widows', 'page', 'page-orientation', 'size', 'bleed', 'marks', 'footnotes', 'running', 'position', 'position-try', 'position-area', 'position-visibility', 'anchor-name', 'anchor-scope', 'position-anchor', 'anchor()', 'anchor-size()', 'anchor-center', 'inset-area', 'top-layer', 'overlay', 'interactivity', 'pointer-events', 'touch-action', 'overscroll-behavior', 'overscroll-behavior-x', 'overscroll-behavior-y', 'scrollbar-width', 'scrollbar-color', 'scrollbar-gutter', 'scrollbar', 'scrollbar-button', 'scrollbar-track', 'scrollbar-track-piece', 'scrollbar-thumb', 'scrollbar-corner', 'scroll-padding', 'scroll-padding-top', 'scroll-padding-right', 'scroll-padding-bottom', 'scroll-padding-left', 'scroll-margin', 'scroll-margin-top', 'scroll-margin-right', 'scroll-margin-bottom', 'scroll-margin-left', 'scroll-snap-type', 'scroll-snap-align', 'scroll-snap-stop', 'scroll-timeline-name', 'scroll-timeline-axis', 'view-timeline-name', 'view-timeline-axis', 'view-timeline-inset', 'animation-timeline', 'animation-range', 'animation-range-start', 'animation-range-end', 'timeline-scope', 'interpolate-size', 'field-sizing', 'reading-flow', 'reading-order', 'text-spacing-trim', 'text-autospace', 'text-box-edge', 'text-box-trim', 'ruby-position', 'ruby-align', 'ruby-merge', 'ruby-overhang', 'initial-letter', 'initial-letter-align', 'initial-letter-wrap', 'hanging-punctuation', 'line-break', 'word-break', 'overflow-wrap', 'white-space', 'white-space-collapse', 'text-wrap', 'text-wrap-mode', 'text-wrap-style', 'text-wrap-balance', 'text-wrap-pretty', 'text-wrap-shift', 'text-spacing', 'text-spacing-trim', 'text-autospace', 'text-box-edge', 'text-box-trim', 'hyphens', 'hyphenate-character', 'hyphenate-limit-chars', 'hyphenate-limit-zone', 'hyphenate-limit-lines', 'hyphenate-character', 'hyphenate-limit-chars', 'hyphenate-limit-zone', 'hyphenate-limit-lines', 'orphans', 'widows', 'page-break-before', 'page-break-after', 'page-break-inside', 'break-before', 'break-after', 'break-inside', 'box-decoration-break', 'box-shadow', 'box-sizing', 'content-visibility', 'contain', 'contain-intrinsic-size', 'contain-intrinsic-width', 'contain-intrinsic-height', 'contain-intrinsic-block-size', 'contain-intrinsic-inline-size', 'container-type', 'container-name', 'container', 'cqw', 'cqh', 'cqi', 'cqb', 'cqmin', 'cqmax', 'style', 'state', 'if', 'media', 'supports', 'layer', 'scope', 'starting-style', 'font-face', 'import', 'charset', 'namespace', 'page', 'counter-style', 'property', 'viewport', 'document', 'keyframes', 'root', 'host', 'host-context', 'is', 'where', 'has', 'not', 'nth-child', 'nth-of-type', 'nth-last-child', 'nth-last-of-type', 'first-child', 'last-child', 'only-child', 'only-of-type', 'empty', 'target', 'enabled', 'disabled', 'checked', 'indeterminate', 'required', 'optional', 'valid', 'invalid', 'in-range', 'out-of-range', 'read-only', 'read-write', 'placeholder-shown', 'autofill', 'default', 'defined', 'focus', 'focus-visible', 'focus-within', 'hover', 'active', 'visited', 'link', 'any-link', 'local-link', 'target-within', 'target-current', 'past', 'future', 'playing', 'paused', 'seeking', 'buffering', 'stalled', 'muted', 'volume-locked', 'open', 'closed', 'modal', 'fullscreen', 'picture-in-picture', 'popover-open', 'user-valid', 'user-invalid', 'dir', 'lang', 'state', 'before', 'after', 'first-letter', 'first-line', 'marker', 'selection', 'placeholder', 'backdrop', 'file-selector-button', 'cue', 'part', 'slotted', 'view-transition', 'view-transition-group', 'view-transition-image-pair', 'view-transition-old', 'view-transition-new'],
};

// Deterministic PRNG per language+type for reproducible output
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h >>> 0;
}
const pick = <T,>(arr: T[], r: () => number): T => arr[Math.floor(r() * arr.length)];
const shuffle = <T,>(arr: T[], r: () => number): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function loadJsons(dir: string): any[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function lessonSnippets(lang: string): { id: string; code: string }[] {
  const out: { id: string; code: string }[] = [];
  const modulesDir = path.join(ROOT, 'languages', lang, 'courses', 'complete-course', 'modules');
  if (!fs.existsSync(modulesDir)) return out;
  for (const m of fs.readdirSync(modulesDir)) {
    const ld = path.join(modulesDir, m, 'lessons');
    for (const f of fs.readdirSync(ld)) {
      const j = JSON.parse(fs.readFileSync(path.join(ld, f), 'utf8'));
      for (const s of j.sections || []) {
        if (s.type === 'code' && s.codeExample && s.codeExample.split('\n').filter((l: string) => l.trim()).length >= 3) {
          out.push({ id: j.id, code: s.codeExample });
        }
      }
    }
  }
  return out;
}

function quizQuestions(lang: string): any[] {
  const qs: any[] = [];
  const qDir = path.join(ROOT, 'languages', lang, 'courses', 'complete-course');
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.json') && p.includes(`${path.sep}quizzes${path.sep}`)) {
        const j = JSON.parse(fs.readFileSync(p, 'utf8'));
        for (const q of j.questions || []) qs.push({ ...q, quizTitle: j.title });
      }
    }
  };
  if (fs.existsSync(qDir)) walk(qDir);
  return qs;
}

function difficultyFor(i: number, total: number): 'easy' | 'medium' | 'hard' {
  const t = i / total;
  return t < 0.4 ? 'easy' : t < 0.75 ? 'medium' : 'hard';
}

for (const lang of LANGS) {
  const kws = KEYWORDS[lang] || KEYWORDS.javascript;
  const r = mulberry32(hash(lang));
  const snippets = lessonSnippets(lang);
  const questions = quizQuestions(lang);
  const outDir = path.join(ROOT, 'games', lang);
  fs.mkdirSync(outDir, { recursive: true });

  // ---------- CODE PUZZLE: reorder shuffled code lines ----------
  const puzzlePool = snippets.filter((s) => s.code.split('\n').length >= 3);
  const puzzles = shuffle(puzzlePool, r).slice(0, 55).map((s, i) => {
    const lines = s.code.split('\n').filter((l) => l.trim() !== '');
    const order = lines.map((_, idx) => idx);
    const shuffledLines = shuffle(lines, r);
    // map each shuffled line back to its original index (first occurrence)
    const used = new Set<number>();
    const displayed = shuffledLines.map((line) => {
      const orig = order.find((oi) => !used.has(oi) && lines[oi] === line);
      if (orig !== undefined) used.add(orig);
      return { text: line, correctIndex: orig ?? 0 };
    });
    return {
      id: `${lang}-puzzle-${String(i + 1).padStart(2, '0')}`,
      lesson: s.id,
      difficulty: difficultyFor(i, 55),
      lines: displayed.map((d) => d.text),
      answer: displayed.map((d) => d.correctIndex).sort((a, b) => a - b).map((oi) => lines[oi]),
      explanation: `This snippet comes from lesson ${s.id}. The correct order runs top to bottom as written.`,
    };
  });
  fs.writeFileSync(path.join(outDir, 'code-puzzle.json'), JSON.stringify(puzzles, null, 2));

  // ---------- BUG HUNTER: pick the line that fixes the bug ----------
  const bugCandidates = snippets.filter((s) => {
    const lines = s.code.split('\n').filter((l) => l.trim());
    return lines.some((l) => kws.some((k) => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(l)));
  });
  const bugItems: any[] = [];
  const perLesson = new Map<string, number>();
  for (const s of shuffle(bugCandidates, r)) {
    if (bugItems.length >= 60) break;
    if ((perLesson.get(s.id) || 0) >= 3) continue;
    const lines = s.code.split('\n').filter((l) => l.trim());
    // collect all (line, keyword) candidates that can be mutated
    const candidates: [number, string][] = [];
    for (let i = 0; i < lines.length; i++) {
      for (const k of kws) {
        if (new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(lines[i])) {
          candidates.push([i, k]);
          break;
        }
      }
    }
    let bugLineIdx = -1, kw = '', wrongKw = '', buggyLine = '', correctLine = '';
    for (const [i, k] of shuffle(candidates, r)) {
      const wk = kws.find((x) => x !== k && !lines[i].includes(x)) || kws[0];
      const bl = lines[i].replace(new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`), wk);
      if (bl !== lines[i]) {
        bugLineIdx = i; kw = k; wrongKw = wk; buggyLine = bl; correctLine = lines[i];
        break;
      }
    }
    if (bugLineIdx < 0) continue;
    // options: correct line, buggy line, + 2 distractor lines from other snippets
    const distractors = shuffle(
      snippets.filter((x) => x.id !== s.id).flatMap((x) => x.code.split('\n').filter((l) => l.trim().length > 3 && l.trim().length < 80)),
      r
    ).slice(0, 2).map((l) => l.trim());
    const options = shuffle([correctLine.trim(), buggyLine.trim(), ...distractors], r);
    bugItems.push({
      id: `${lang}-bug-${String(bugItems.length + 1).padStart(2, '0')}`,
      lesson: s.id,
      difficulty: difficultyFor(bugItems.length, 55),
      code: lines.map((l, i) => (i === bugLineIdx ? buggyLine : l)).join('\n'),
      buggyLine: bugLineIdx + 1,
      options,
      answer: correctLine.trim(),
      explanation: `Line ${bugLineIdx + 1} uses "${wrongKw}" where "${kw}" belongs. Check keyword spelling and context.`,
    });
    perLesson.set(s.id, (perLesson.get(s.id) || 0) + 1);
  }
  fs.writeFileSync(path.join(outDir, 'bug-hunter.json'), JSON.stringify(bugItems, null, 2));

  // ---------- MATCH PAIRS: quiz question -> correct answer ----------
  const mcqPool = questions.filter((q) => q.type === 'mcq' && q.question && q.correctAnswer);
  const matchRounds: any[] = [];
  const shuffledMcq = shuffle(mcqPool, r);
  for (let i = 0; i + 4 <= shuffledMcq.length && matchRounds.length < 14; i += 4) {
    const chunk = shuffledMcq.slice(i, i + 4);
    const lefts = chunk.map((q) => q.question.length > 90 ? q.question.slice(0, 87) + '...' : q.question);
    const rights = chunk.map((q) => String(q.correctAnswer));
    const allRights = shuffle([...rights, ...shuffle(mcqPool.map((q) => String(q.correctAnswer)), r).slice(0, 4)], r);
    matchRounds.push({
      id: `${lang}-match-${String(matchRounds.length + 1).padStart(2, '0')}`,
      difficulty: difficultyFor(matchRounds.length, 14),
      pairs: chunk.map((q, j) => ({ left: lefts[j], right: rights[j] })),
      distractors: allRights.filter((x) => !rights.includes(x)).slice(0, 4),
    });
  }
  fs.writeFileSync(path.join(outDir, 'match-pairs.json'), JSON.stringify(matchRounds, null, 2));

  // ---------- FILL IN THE BLANK ----------
  const fillItems: any[] = [];
  // (a) quiz fill-blank questions
  for (const q of questions.filter((x) => x.type === 'fill-blank')) {
    fillItems.push({
      id: `${lang}-fill-q-${q.id || fillItems.length}`,
      difficulty: 'medium' as const,
      prompt: q.question,
      code: null,
      answer: String(q.correctAnswer),
      options: q.options ? shuffle(q.options, r) : undefined,
      explanation: q.explanation || '',
    });
  }
  // (b) generated blanks from code snippets
  for (const s of shuffle(snippets, r)) {
    if (fillItems.length >= 60) break;
    const lines = s.code.split('\n');
    let made = 0;
    for (let i = 0; i < lines.length && made < 2; i++) {
      for (const kw of kws) {
        if (made >= 2) break;
        const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
        if (re.test(lines[i])) {
          const blanked = lines[i].replace(re, '_____');
          const distractors = shuffle(kws.filter((k) => k !== kw), r).slice(0, 3);
          fillItems.push({
            id: `${lang}-fill-${String(fillItems.length + 1).padStart(2, '0')}`,
            lesson: s.id,
            difficulty: difficultyFor(fillItems.length, 60),
            prompt: `Complete the missing keyword in this ${lang} code:`,
            code: lines.map((l, j) => (j === i ? blanked : l)).join('\n'),
            answer: kw,
            options: shuffle([kw, ...distractors], r),
            explanation: `"${kw}" is the correct keyword here — check the lesson on ${s.id} for context.`,
          });
          made++;
          break;
        }
      }
    }
  }
  fs.writeFileSync(path.join(outDir, 'fill-blank.json'), JSON.stringify(fillItems.slice(0, 60), null, 2));

  console.log(`${lang}: puzzles=${puzzles.length} bugs=${bugItems.length} matches=${matchRounds.length} fills=${Math.min(fillItems.length, 60)}`);
}
console.log('Done.');
