import { Col, Row } from 'react-bootstrap'
import Link from 'next/link'
import LoginForm from '@/app/(authentication)/login/login'
import { SearchParams } from '@/types/next'
import { getDictionary } from '@/locales/dictionary'

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const dict = await getDictionary()

  return (
    <Row className="justify-content-center align-items-center px-3">
      <Col lg={8}>
        <Row>
          <Col md={7} className="bg-white dark:bg-dark border p-5">
            <div>
              <h1>Login</h1>
              <p className="text-black-50 dark:text-gray-500">Sign in to your acccount</p>

              <LoginForm/>
            </div>
          </Col>
          <Col
            md={5}
            className="bg-primary text-white d-flex align-items-center justify-content-center p-5"
          >
            <div className="text-center">
              <h2>Sign Up</h2>
              <p>Sign up to Yapa Hub to enjoy our customer experince platform. A culture provoking platform that masses the power of Artificial Intellgence.</p>
              <Link className="btn btn-lg btn-outline-light mt-3" href="/register">
                Register Now!
              </Link>
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}
