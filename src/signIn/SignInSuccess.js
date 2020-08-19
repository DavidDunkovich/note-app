import React from 'react'
import { Result } from 'antd';

const SignInSuccess = () => (
  <div className='spinner'>
    <Result
      status="success"
      title="See you in a bit!"
      subTitle="An email has been sent to you with a link to access your account. Feel free to close this tab."
    />
  </div>
);

export default SignInSuccess;