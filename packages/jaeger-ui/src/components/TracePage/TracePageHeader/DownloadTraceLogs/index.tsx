import * as React from 'react';
import { Button } from 'antd';
import cx from 'classnames';
import IoAndroidDownload from 'react-icons/lib/io/android-download';

import { downloadBlob } from '../../../../utils/download-file';
import { Trace } from '../../../../types/trace';
import LoginModalForm from './LoginModalForm';
import TraceOptionsModalForm, { TraceOptions } from './TraceOptionsModalForm';

import './DownloadTraceLogs.css';

type DownloadTraceLogsProps = {
  trace: Trace;
  className?: string;
}

const TIME_SHIFT = 10 * 1000 * 1000; // 10 sec in microseconds;
const LOGS_CAPACITY = 90 * 60 * 1000; // 90 min in milliseconds;
const CONSOLE_TOKEN_KEY = '_console_token';
const DEPLOYMENT_ID_KEY = 'rioDeploymentId';
const PROJECT_ID_KEY = 'rioProjectId';

const DownloadTraceLogs = ({ trace, className }: DownloadTraceLogsProps) => {
  const [loginFormIsVisible, setLoginFormIsVisible] = React.useState<boolean>(false);
  const [optionsFormIsVisible, setOptionsFormIsVisible] = React.useState<boolean>(false);
  let projectId: string;
  const deploymentIdsSet: Set<string> = new Set<string>();

  Object.values(trace.processes).forEach(({ tags }) => tags.forEach(({ key, value }) => {
    if (key === PROJECT_ID_KEY && !!value) {
      projectId = value;
    } else if (key === DEPLOYMENT_ID_KEY && !!value) {
      deploymentIdsSet.add(value);
    }
  }));

  const defaultOptions = {
    startTime: (trace.startTime - TIME_SHIFT) / 1000, // to milliseconds
    endTime: (trace.endTime + TIME_SHIFT) / 1000, // to milliseconds
    deploymentIds: [...deploymentIdsSet],
  };

  const showLoginModal = () => {
    setOptionsFormIsVisible(false);
    setLoginFormIsVisible(true);
  };

  const closeLoginModal = () => {
    setLoginFormIsVisible(false);
  };

  const showOptionsModal = () => {
    setLoginFormIsVisible(false);
    setOptionsFormIsVisible(true);
  };

  const closeOptionsModal = () => {
    setOptionsFormIsVisible(false);
  };

  const tokenReceivedHandler = (token: string | null) => {
    if (token) {
      sessionStorage.setItem(CONSOLE_TOKEN_KEY, token);
      showOptionsModal();
    } else {
      sessionStorage.removeItem(CONSOLE_TOKEN_KEY);
      showLoginModal();
    }
  };

  // eslint-disable-next-line consistent-return
  const optionsReceivedHandler = ({ startTime, endTime, deploymentIds }: TraceOptions) => {
    closeOptionsModal();

    const timeChains = [];
    let chainStartTime = startTime;
    let chainEndTime = startTime + LOGS_CAPACITY;

    while (chainEndTime < endTime) {
      timeChains.push({
        start: chainStartTime,
        end: chainEndTime,
      });
      chainStartTime = chainEndTime;
      chainEndTime = chainStartTime + LOGS_CAPACITY;
    }

    timeChains.push({
      start: chainStartTime,
      end: chainEndTime,
    });

    const authToken = sessionStorage.getItem(CONSOLE_TOKEN_KEY);

    if (authToken) {
      Promise.all(timeChains.map(({ start, end }) => {
        // @ts-ignore
        return fetch(`${window._env_.CONSOLE_URL}/logs/project`, {
          method: 'post',
          headers: {
            project: projectId,
            Authorization: authToken,
          },
          body: JSON.stringify({
            deployments: deploymentIds.map(deploymentId => ({ deploymentId })),
            type: 'both',
            startTime: start,
            endTime: end,
          }),
        }).then(response => {
          if (response.ok) {
            return response.blob();
          }

          throw new Error(response.statusText);
        }).then(blob => downloadBlob(blob, `${trace.traceID}.tar`));
      })).catch(() => {
        sessionStorage.removeItem(CONSOLE_TOKEN_KEY);
        showLoginModal();
      });
    }
  };

  const downloadLogsHandler = () => {
    const authToken = sessionStorage.getItem(CONSOLE_TOKEN_KEY);

    if (authToken) {
      showOptionsModal();
    } else {
      showLoginModal();
    }
  };

  return (
    <Button
      className={cx('DownloadTraceLogs ub-flex ub-items-center', className)}
      onClick={downloadLogsHandler}
    >
      <IoAndroidDownload className='DownloadTraceLogs--logsIcon' />
      <LoginModalForm
        visible={loginFormIsVisible}
        onCancel={closeLoginModal}
        onToken={tokenReceivedHandler}
      />
      <TraceOptionsModalForm
        visible={optionsFormIsVisible}
        onCancel={closeOptionsModal}
        onOptions={optionsReceivedHandler}
        defaultOptions={defaultOptions}
      />
    </Button>
  );
};

export default DownloadTraceLogs;
