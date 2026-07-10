// React 19 的服务端组件调试时间来自服务端时钟，开发时偶尔会早于浏览器的
// performance.timeOrigin。Chrome 会把负数时间当成异常，继而让 Next 开发工具显示问题徽标。
// 这里只修正开发环境中的非法调试时间；生产环境和所有正常性能记录保持浏览器原行为。
if (process.env.NODE_ENV === "development" && typeof performance !== "undefined") {
  const originalMeasure = performance.measure.bind(performance);

  const safeMeasure = ((
    measureName: string,
    startOrOptions?: string | PerformanceMeasureOptions,
    endMark?: string,
  ) => {
    if (typeof startOrOptions !== "object" || startOrOptions === null) {
      return originalMeasure(measureName, startOrOptions, endMark);
    }

    const safeOptions = sanitizeMeasureOptions(startOrOptions);
    return originalMeasure(measureName, safeOptions);
  }) as Performance["measure"];

  Object.defineProperty(performance, "measure", {
    configurable: true,
    value: safeMeasure,
  });
}

function sanitizeMeasureOptions(options: PerformanceMeasureOptions) {
  const safeStart = sanitizeTimestamp(options.start);
  let safeEnd = sanitizeTimestamp(options.end);
  const safeDuration =
    typeof options.duration === "number"
      ? Math.max(0, options.duration)
      : options.duration;

  // 浏览器还要求结束时间不能早于开始时间，否则同样会抛出 User Timing 异常。
  if (
    typeof safeStart === "number" &&
    typeof safeEnd === "number" &&
    safeEnd < safeStart
  ) {
    safeEnd = safeStart;
  }

  return {
    ...options,
    ...(safeDuration === undefined ? {} : { duration: safeDuration }),
    ...(safeEnd === undefined ? {} : { end: safeEnd }),
    ...(safeStart === undefined ? {} : { start: safeStart }),
  } satisfies PerformanceMeasureOptions;
}

function sanitizeTimestamp(value: string | number | undefined) {
  return typeof value === "number" ? Math.max(0, value) : value;
}
