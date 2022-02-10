export function headerLength (answers) {
  return answers.type.length + 2 + (answers.scope ? answers.scope.length + 2 : 0)
}

export function maxSummaryLength (options, answers) {
  return options.maxHeaderWidth - headerLength(answers)
}

export function filterSubject (subject) {
  subject = subject.trim()

  if (subject.charAt(0).toLowerCase() !== subject.charAt(0)) {
    subject = subject.charAt(0).toLowerCase() + subject.slice(1, subject.length)
  }

  while (subject.endsWith('.')) {
    subject = subject.slice(0, subject.length - 1)
  }

  return subject
}
