import * as log4javascript from 'log4javascript';

// 1. 获取根 logger
const logger = log4javascript.getLogger('main');

// 2. 创建 BrowserConsoleAppender (输出到浏览器控制台)
const consoleAppender = new log4javascript.BrowserConsoleAppender();

// 3. 定义日志格式布局 (共享)
const layout = new log4javascript.PatternLayout('%d{HH:mm:ss.SSS} [%p] %c - %m%n');
consoleAppender.setLayout(layout);

// 4. 将 ConsoleAppender 添加到 logger
logger.addAppender(consoleAppender);

// 5. 设置全局日志级别
logger.setLevel(log4javascript.Level.DEBUG);

// InPageAppender instance - to be initialized after its DOM element is ready
let inPageAppenderInstance: log4javascript.InPageAppender | null = null;

// Function to initialize the InPageAppender
function initializeInPageAppender() {
  if (inPageAppenderInstance) {
    logger.debug('InPageAppender already initialized.');
    return;
  }

  const targetDivElement = document.getElementById('inPageLogDiv');
  if (targetDivElement) {
    try {
      // Pass the HTMLElement object directly to the constructor.
      const appender = new log4javascript.InPageAppender(targetDivElement);
      appender.setHeight(200); // Use numeric value for height in pixels
      appender.setShowCommandLine(false);
      appender.setInitiallyMinimized(true);
      appender.setLayout(layout); // Reuse the same layout
      
      logger.addAppender(appender);
      inPageAppenderInstance = appender;
      logger.info('InPageAppender initialized and attached to #inPageLogDiv.');
    } catch (error) {
      logger.error('Error initializing InPageAppender:', error);
    }
  } else {
    logger.error('Cannot initialize InPageAppender: target HTMLElement with ID "inPageLogDiv" not found.');
  }
}

// Renamed function: setups the DOM elements and then initializes the InPageAppender
export function setupPageLogger() {
  let logDivContainer = document.getElementById('inPageLogDivContainer');
  
  if (!logDivContainer) {
    logDivContainer = document.createElement('div');
    logDivContainer.id = 'inPageLogDivContainer';
    logDivContainer.style.position = 'fixed';
    logDivContainer.style.bottom = '0';
    logDivContainer.style.left = '0';
    logDivContainer.style.width = '100%';
    logDivContainer.style.zIndex = '9999';
    logDivContainer.style.backgroundColor = 'rgba(240, 240, 240, 0.95)';
    logDivContainer.style.borderTop = '1px solid #ccc';
    logDivContainer.style.maxHeight = '250px'; 
    logDivContainer.style.boxShadow = '0 -2px 10px rgba(0,0,0,0.15)';
    logDivContainer.style.transition = 'max-height 0.3s ease-in-out';
    logDivContainer.style.overflow = 'hidden'; // Container itself hides overflow

    // Create the inner div that InPageAppender will write to
    const innerLogDiv = document.createElement('div');
    innerLogDiv.id = 'inPageLogDiv'; 
    // InPageAppender will manage the content and scrolling of innerLogDiv
    // We can set some basic styles for innerLogDiv if needed, e.g., height, but InPageAppender controls it.
    logDivContainer.appendChild(innerLogDiv);
    document.body.appendChild(logDivContainer);
    logger.info('In-page log container (#inPageLogDivContainer) and target div (#inPageLogDiv) created.');
  } else {
    // Ensure inner div exists if container was already there (e.g. HMR)
    if (!document.getElementById('inPageLogDiv')) {
      const innerLogDiv = document.createElement('div');
      innerLogDiv.id = 'inPageLogDiv';
      logDivContainer.appendChild(innerLogDiv);
      logger.info('Inner target div (#inPageLogDiv) created within existing container.');
    }
  }
  
  // Now that the DOM structure is guaranteed, initialize the InPageAppender
  initializeInPageAppender();
}

// Export the main logger instance
export default logger;

