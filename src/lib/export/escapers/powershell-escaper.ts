/**
 * PowerShell Escaper
 * Handles escaping strings for PowerShell
 */

/**
 * Escape string for PowerShell
 *
 * PowerShell uses backtick (`) as the escape character.
 * Special characters that need escaping:
 * - Backtick (`)
 * - Dollar sign ($)
 * - Double quote (")
 * - Newline (\n)
 * - Carriage return (\r)
 *
 * @param str - String to escape
 * @returns Escaped string for PowerShell
 *
 * @example
 * escapePowerShellArg('test$variable') // => 'test`$variable'
 * escapePowerShellArg('test"quote') // => 'test`"quote'
 */
export function escapePowerShellArg(str: string): string {
  return str
    .replace(/`/g, '``')
    .replace(/\$/g, '`$')
    .replace(/"/g, '`"')
    .replace(/\n/g, '`n')
    .replace(/\r/g, '`r');
}
