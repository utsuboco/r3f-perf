import React from 'react'
import { Link, Route } from 'wouter'
import { createCss } from '@stitches/react'

import styles from './styles.module.css'

import Minimal from './sandboxes/perf-minimal/src/App'

const { styled } = createCss({
  theme: {
    colors: { pageBackground: '#f7f7f7' },
    sizes: { maxWidth: '720px' },
  },
})

const Page = styled('div', {
  margin: '0 auto',
  maxWidth: '$maxWidth',
  padding: '20vh 16px 0',
  background: '$pageBackground',
  minHeight: '100vh',
})

const links = {
  'perf-minimal': Minimal
}

const Example = ({ link }) => {
  const Component = links[link]

  return (
    <div>
      <Link href="/">
        {/*eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a className={styles.back}>← Back</a>
      </Link>
      <Component />
    </div>
  )
}

export default function App() {
  return (
    <>
      <Route path="/">
        <Page>
          <h1>Leva demos</h1>
          <h2>Sandboxes</h2>
          <div className={styles.linkList}>
            {Object.keys(links).map((link) => (
              <Link key={link} href={`/${link}`}>
                {/*eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a className={styles.link}>{link}</a>
              </Link>
            ))}
          </div>
        </Page>
      </Route>
      <Route path="/:link">{(params) => <Example link={params.link} />}</Route>
    </>
  )
}
