import * as React from 'react';
import { Button, DatePicker, Form, Modal, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import moment, { Moment } from 'moment';

import './TraceOptionsModalForm.css';

const { Option } = Select;

export type TraceOptions = {
  startTime: number;
  endTime: number;
  deploymentIds: string[];
}

type FormValues = {
  startTime: Moment;
  endTime: Moment;
  shiftTime: number;
  deploymentIds: string[];
}

type TraceOptionsModalFormProps = FormComponentProps & {
  visible: boolean;
  onCancel: () => void;
  onOptions: (options: TraceOptions) => void;
  defaultOptions: TraceOptions;
};

const DEFAULT_TIME_SHIFT = 10 * 1000; // 10 sec in milliseconds

const timeShifts = [{
  label: 'Custom',
  value: 0,
}, {
  label: '10 sec',
  value: DEFAULT_TIME_SHIFT,
}, {
  label: '30 sec',
  value: 30 * 1000,
}, {
  label: '1 min',
  value: 60 * 1000,
}, {
  label: '5 min',
  value: 5 * 60 * 1000,
}, {
  label: '10 min',
  value: 10 * 60 * 1000,
}, {
  label: '30 min',
  value: 30 * 60 * 1000,
}, {
  label: '60 min',
  value: 60 * 60 * 1000,
}];

const TraceOptionsModalForm = (props: TraceOptionsModalFormProps) => {
  const { visible, form, onCancel, onOptions, defaultOptions } = props;
  const { startTime, endTime, deploymentIds = [] } = form.getFieldsValue() as FormValues;

  React.useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        startTime: moment(defaultOptions.startTime - DEFAULT_TIME_SHIFT),
        endTime: moment(defaultOptions.endTime + DEFAULT_TIME_SHIFT),
        timeShift: DEFAULT_TIME_SHIFT,
        deploymentIds: defaultOptions.deploymentIds,
      });
    }
  }, [visible]);

  const timeChangeHandler = () => {
    form.setFieldsValue({
      timeShift: 0,
    });
  };

  const timeShiftChangeHandler = (nextValue: any) => {
    const nextTimeShift = nextValue as number;

    form.setFieldsValue({
      startTime: moment(defaultOptions.startTime).subtract(nextTimeShift, 'milliseconds'),
      endTime: moment(defaultOptions.endTime).add(nextTimeShift, 'milliseconds'),
    });
  };

  const handleCancel = (event: React.MouseEvent) => {
    event.stopPropagation();
    onCancel();
  };

  const handleSubmitOptions = (event: React.MouseEvent) => {
    event.stopPropagation();
    form.validateFields((err, values) => {
      if (!err) {
        onOptions({
          startTime: values.startTime.valueOf(),
          endTime: values.endTime.valueOf(),
          deploymentIds: values.deploymentIds,
        });
      }
    });
  };

  const renderFooter = () => (
    <div>
      <Button onClick={handleCancel}>Cancel</Button>
      <Button onClick={handleSubmitOptions} type='primary'>Ok</Button>
    </div>
  );

  return (
    <Modal visible={visible} title='Time Options' footer={renderFooter()} onCancel={handleCancel}>
      <Form>
        <div className='TraceOptionsModalForm--times'>
          <Form.Item label='Start Time'>
            {form.getFieldDecorator('startTime', {
              rules: [{
                required: true,
                message: 'Please input start time!',
              }],
            })(
              <DatePicker
                showTime={{ format: 'HH:mm:ss' }}
                format='YYYY-MM-DD HH:mm:ss'
                style={{ width: '100%' }}
                disabledDate={date => date.isSameOrAfter(endTime)}
                onChange={timeChangeHandler}
              />,
            )}
          </Form.Item>
          <Form.Item label='End Time'>
            {form.getFieldDecorator('endTime', {
              rules: [{
                required: true,
                message: 'Please input end time!',
              }],
            })(
              <DatePicker
                showTime={{ format: 'HH:mm:ss' }}
                format='YYYY-MM-DD HH:mm:ss'
                style={{ width: '100%' }}
                disabledDate={date => date.isSameOrBefore(startTime)}
                onChange={timeChangeHandler}
              />,
            )}
          </Form.Item>
        </div>
        <Form.Item label='Time Shift'>
          {form.getFieldDecorator('timeShift', {
            rules: [{
              required: true,
              message: 'Please fill time shift!',
            }],
          })(
            <Select style={{ width: '100%' }} onChange={timeShiftChangeHandler}>
              {timeShifts.map(({ label, value }) => (
                <Option key={value} value={value}>
                  {label}
                </Option>
              ))}
            </Select>,
          )}
        </Form.Item>
        <Form.Item label='Deployments'>
          {form.getFieldDecorator('deploymentIds', {
            rules: [{
              required: true,
              message: 'Please fill deployments!',
            }],
          })(
            <Select style={{ width: '100%' }} mode='tags'>
              {deploymentIds.map(deploymentId => (
                <Option key={deploymentId} value={deploymentId}>
                  {deploymentId}
                </Option>
              ))}
            </Select>,
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Form.create<TraceOptionsModalFormProps>()(TraceOptionsModalForm);
