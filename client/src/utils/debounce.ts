function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timerId: ReturnType<typeof setTimeout> | undefined = undefined

  return (...args: Parameters<T>): void => {
    if (timerId !== undefined) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(() => func(...args), wait)
  }
}

export default debounce
