import React from 'react'
import { Container } from 'react-bootstrap'

export default function Footer() {
  return (
    <footer className="footer border-top px-sm-2 py-2">
      <Container fluid className="text-center align-items-center flex-column flex-md-row d-flex justify-content-between">
        <div>
          <a className="text-decoration-none" href="https://yapahub.com">Yapa Hub </a>
          <a className="text-decoration-none" href="https://yapahub.com">
          </a>
          {' '}
          © 2025
          Ony Consulting Group
        </div>
      </Container>
    </footer>
  )
}
