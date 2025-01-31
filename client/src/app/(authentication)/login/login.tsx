'use client'

import {
  Alert, Button, Col, Form, FormControl, InputGroup, Row,
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-regular-svg-icons'
import { faLock } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import Link from 'next/link'
import InputGroupText from 'react-bootstrap/InputGroupText'
import { useRouter } from 'next/navigation'
import useDictionary from '@/locales/dictionary-hook'
import { loginUser } from '@/services/auth'

export default function Login() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const dict = useDictionary()

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Call the login function which communicates with Django backend
      const { access, refresh } = await loginUser({ username, password })

      // Print tokens to see them
      console.log("accessToken" + access);
      
      // Store JWT tokens in localStorage
      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)

      // Redirect to callback URL (e.g., dashboard)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {error && (
        <Alert
          variant="danger"
          onClose={() => setError('')}
          dismissible
        >
          {error}
        </Alert>
      )}

      <Form onSubmit={login}>
        {/* Username Field */}
        <InputGroup className="mb-3">
          <InputGroupText>
            <FontAwesomeIcon icon={faUser} fixedWidth />
          </InputGroupText>
          <FormControl
            name="username"
            required
            disabled={submitting}
            aria-label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </InputGroup>

        {/* Password Field */}
        <InputGroup className="mb-3">
          <InputGroupText>
            <FontAwesomeIcon icon={faLock} fixedWidth />
          </InputGroupText>
          <FormControl
            type="password"
            name="password"
            required
            disabled={submitting}
            // aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputGroup>

        <Row className="align-items-center">
          <Col xs={6}>
            <Button
              className="px-4"
              variant="primary"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Logging in...' : dict.login.form.submit}
            </Button>
          </Col>
          <Col xs={6} className="text-end">
            <Link className="px-0" href="#">
              {dict.login.forgot_password}
            </Link>
          </Col>
        </Row>
      </Form>
    </>
  )
}
