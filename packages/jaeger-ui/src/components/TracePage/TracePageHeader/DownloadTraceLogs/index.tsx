import * as React from 'react';
import { Button } from 'antd';
import cx from 'classnames';
import IoAndroidDownload from 'react-icons/lib/io/android-download';

import { downloadBlob } from '../../../../utils/download-file';
import { Process } from '../../../../types/trace';
import TraceOptionsModalForm, { TraceOptions } from './TraceOptionsModalForm';

import './DownloadTraceLogs.css';

type DownloadTraceLogsProps = {
  logsStartTime: number;
  logsEndTime: number;
  logsProcesses: Process[];
  className?: string;
}

const LOGS_CAPACITY = 90 * 60 * 1000; // 90 min in milliseconds;
const DEPLOYMENT_ID_KEY = 'rioDeploymentId';
const PROJECT_ID_KEY = 'rioProjectId';

const DownloadTraceLogs = (props: DownloadTraceLogsProps) => {
  const { logsStartTime, logsEndTime, logsProcesses, className } = props;
  const [optionsFormIsVisible, setOptionsFormIsVisible] = React.useState<boolean>(false);
  let projectId: string;
  const deploymentIdsSet: Set<string> = new Set<string>();

  Object.values(logsProcesses).forEach(({ tags }) => tags.forEach(({ key, value }) => {
    if (key === PROJECT_ID_KEY && !!value) {
      projectId = value;
    } else if (key === DEPLOYMENT_ID_KEY && !!value) {
      deploymentIdsSet.add(value);
    }
  }));

  const defaultOptions = {
    startTime: logsStartTime / 1000, // to milliseconds
    endTime: logsEndTime / 1000, // to milliseconds
    deploymentIds: [...deploymentIdsSet],
  };

  const showOptionsModal = () => {
    setOptionsFormIsVisible(true);
  };

  const closeOptionsModal = () => {
    setOptionsFormIsVisible(false);
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

    Promise.all(timeChains.map(({ start, end }) => {
      // @ts-ignore
      return fetch('/logs/project', {
        method: 'post',
        headers: {
          project: projectId,
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
      }).then(blob => downloadBlob(blob, `${startTime}.tar`));
    })).catch(() => {
      showOptionsModal();
    });
  };

  return (
    <Button
      className={cx('DownloadTraceLogs ub-flex ub-items-center', className)}
      onClick={showOptionsModal}
    >
      <IoAndroidDownload className='DownloadTraceLogs--logsIcon' />
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
