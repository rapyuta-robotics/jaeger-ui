import * as React from 'react';
import { message } from 'antd';
import IoIosCopyOutline from 'react-icons/lib/io/ios-copy-outline';

import { formatDatetime } from '../../../utils/date';

import './index.css';

const TraceTime = ({ time }: { time: number }) => {
  const [showFormatted, setShowFormatted] = React.useState<boolean>(true);
  const timeStr = `${time}`;
  const matchNotFormatted = timeStr.match(/^(.+)(\d{3})$/);
  const dateStr = formatDatetime(time);
  const matchFormatted = dateStr.match(/^(.+)(\.\d+)$/);

  const toggleFormatted = () => setShowFormatted(!showFormatted);

  const copyToClipboard = async () => {
    let date = timeStr;

    if (showFormatted) {
      date = matchFormatted
        ? `${matchFormatted[1]}${matchFormatted[2]}`
        : dateStr;
    } else if (matchNotFormatted) {
      date = `${matchNotFormatted[1]}.${matchNotFormatted[2]}`;
    }

    await navigator.clipboard.writeText(date);

    message.success('Copied!', 1);
  };

  return (
    <span className="TraceTime--overviewItem">
      <span className="TraceTime--overviewItem--value" onClick={toggleFormatted}>
        {(() => {
          if (showFormatted) {
            if (matchFormatted) {
              return (
                <>
                  {matchFormatted[1]}
                  <span className="TraceTime--overviewItem--valueDetail">{matchFormatted[2]}</span>
                </>
              );
            }

            return dateStr;
          }

          if (matchNotFormatted) {
            return (
              <>
                {matchNotFormatted[1]}
                <span className="TraceTime--overviewItem--valueDetail">.{matchNotFormatted[2]}</span>
              </>
            );
          }

          return timeStr;
        })()}
      </span>
      <IoIosCopyOutline className="TraceTime--overviewItem--copy" onClick={copyToClipboard} />
    </span>
  );
};

export default TraceTime;
