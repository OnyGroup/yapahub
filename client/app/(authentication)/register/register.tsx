'use client'

import {
  Alert, Button, Form, FormControl, InputGroup,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faUser } from '@fortawesome/free-regular-svg-icons';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import InputGroupText from 'react-bootstrap/InputGroupText';
import useDictionary from '@/locales/dictionary-hook';
import { registerUser } from '@/services/auth';
import { RegisterUserData } from '@/types/auth';

export default function Register() {
  const router = useRouter();
  const dict = useDictionary();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<RegisterUserData>({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await registerUser(formData);
      if (response) {
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Alert variant="danger" show={!!error} onClose={() => setError('')} dismissible>{error}</Alert>
      <Form onSubmit={handleSubmit}>
        <InputGroup className="mb-3">
          <InputGroupText><FontAwesomeIcon icon={faUser} fixedWidth /></InputGroupText>
          <FormControl
            name="username"
            required
            disabled={submitting}
            placeholder={dict.signup.form.username}
            aria-label="Username"
            value={formData.username}
            onChange={handleChange}
          />
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroupText>
            <FontAwesomeIcon icon={faEnvelope} fixedWidth />
          </InputGroupText>
          <FormControl
            type="email"
            name="email"
            required
            disabled={submitting}
            placeholder={dict.signup.form.email}
            aria-label="Email"
            value={formData.email}
            onChange={handleChange}
          />
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroupText><FontAwesomeIcon icon={faLock} fixedWidth /></InputGroupText>
          <FormControl
            type="password"
            name="password"
            required
            disabled={submitting}
            placeholder={dict.signup.form.password}
            aria-label="Password"
            value={formData.password}
            onChange={handleChange}
          />
        </InputGroup>

        <Button type="submit" className="d-block w-100" disabled={submitting} variant="success">
          {dict.signup.form.submit}
        </Button>
      </Form>
    </>
  );
}
