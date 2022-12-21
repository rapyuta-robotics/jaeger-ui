import * as React from 'react';
import { Button, DatePicker, Form, Modal, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import moment from 'moment';

const { Option } = Select;

export type TraceOptions = {
  startTime: number;
  endTime: number;
  deploymentIds: string[];
}

type TraceOptionsModalFormProps = FormComponentProps & {
  visible: boolean;
  onCancel: () => void;
  onOptions: (options: TraceOptions) => void;
  defaultOptions: TraceOptions;
};

const TraceOptionsModalForm = (props: TraceOptionsModalFormProps) => {
  const { visible, form, onCancel, onOptions, defaultOptions } = props;
  const { startTime, endTime, deploymentIds = [] } = form.getFieldsValue() as TraceOptions;

  React.useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        startTime: moment(defaultOptions.startTime),
        endTime: moment(defaultOptions.endTime),
        deploymentIds: defaultOptions.deploymentIds,
      });
    }
  }, [visible]);

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
            />,
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
