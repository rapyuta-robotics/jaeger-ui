import * as React from 'react';
import { Button, Form, Input, message, Modal } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';

import './LoginModalForm.css';

type LoginModalFormProps = FormComponentProps & {
  visible: boolean;
  onCancel: () => void;
  onToken: (token: string | null) => void;
};

const LoginModalForm = ({ visible, form, onCancel, onToken }: LoginModalFormProps) => {
  const [loginInProgress, setLoginInProgress] = React.useState<boolean>(false);
  const formFieldsValue: any = form.getFieldsValue();

  React.useEffect(() => {
    form.resetFields();
  }, [visible]);

  const handleCancel = (event: React.MouseEvent) => {
    event.stopPropagation();
    onCancel();
  }

  const handleSubmitLogin = (event: React.MouseEvent) => {
    event.stopPropagation();
    form.validateFields((err, values) => {
      if (!err) {
        if (values.token) {
          onToken(values.token);
        } else {
          setLoginInProgress(true);
          // @ts-ignore
          fetch(`${window._env_.CONSOLE_AUTH_URL}/user/login`, {
            method: 'post',
            body: JSON.stringify({
              email: values.email,
              password: values.password,
            }),
          })
            .then(response => {
              if (response.ok) {
                return response.json();
              }

              throw new Error(response.statusText);
            })
            .then(({ data }) => `Bearer ${data.token}`)
            .then(token => onToken(token))
            .catch((error?: Error) => {
              if (!!error && !!error.message) {
                message.error(error.message);
              }

              onToken(null);
            })
            .finally(() => setLoginInProgress(false));
        }
      }
    });
  };

  const renderFooter = () => (
    <div>
      <Button onClick={handleCancel} disabled={loginInProgress}>Cancel</Button>
      <Button onClick={handleSubmitLogin} type='primary' disabled={loginInProgress}>Ok</Button>
    </div>
  );

  return (
    <Modal visible={visible} title='Login' footer={renderFooter()} onCancel={handleCancel}>
      <Form>
        <Form.Item label='Token'>
          {form.getFieldDecorator('token', {
            rules: [{
              required: !formFieldsValue.email && !formFieldsValue.password || !!formFieldsValue.token,
              message: 'Please input your token!',
            }],
          })(<Input disabled={loginInProgress} autoComplete='off' />)}
        </Form.Item>
        <div className='LoginModalForm--formSplitter' />
        <Form.Item label='E-mail'>
          {form.getFieldDecorator('email', {
            rules: [{
              type: 'email',
              message: 'The input is not valid E-mail!',
            }, {
              required: !formFieldsValue.token,
              message: 'Please input your E-mail!',
            }],
          })(<Input disabled={loginInProgress} autoComplete='off' />)}
        </Form.Item>
        <Form.Item label='Password'>
          {form.getFieldDecorator('password', {
            rules: [{
              required: !formFieldsValue.token,
              message: 'Please input your password!',
            }],
          })(<Input disabled={loginInProgress} type='password' autoComplete='off' />)}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Form.create<LoginModalFormProps>()(LoginModalForm);
