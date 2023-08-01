import { useLayoutEffect, useEffect } from 'react'
import { Link } from 'react-router-dom'
import classNames from 'classnames/bind'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Avatar from '@mui/joy/Avatar'
import Chip from '@mui/joy/Chip'
import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import Button from '@mui/joy/Button'
import { AddRegular } from '@fluentui/react-icons'

import useScript from '../../hooks/useScript'
import WorksTable from '../../pages/components/WorksTable'
import Banner from '../../pages/components/Banner'
import config from '../../config'
import styles from './WorkDashboard.module.scss'

const cx = classNames.bind(styles)
const useEnhancedEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function WorkDashboard() {
    const status = useScript(`https://unpkg.com/feather-icons`)

    useEnhancedEffect(() => {
        // Feather icon setup: https://github.com/feathericons/feather#4-replace
        // @ts-ignore
        if (typeof feather !== 'undefined') {
            // @ts-ignore
            // eslint-disable-next-line no-undef
            feather.replace()
        }
    }, [status])

    return (
        <div>
            <Box>
                <Container>
                    <Row>
                        {/* Banner */}
                        <Col xs={12} className={cx('banner-wrapper')}>
                            <Banner title="Work Dashboard" />
                        </Col>

                        {/* Work table */}
                        <Col xs={9}>
                            <Card
                                variant="outlined"
                                sx={{
                                    width: '100%',
                                }}
                            >
                                <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
                                    <Box
                                        component="main"
                                        className="MainContent"
                                        sx={() => ({
                                            px: '24px',
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            minWidth: 0,
                                            height: '100dvh',
                                            gap: 1,
                                        })}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                my: 1,
                                                gap: 1,
                                                flexWrap: 'wrap',
                                                '& > *': {
                                                    minWidth: 'clamp(0px, (500px - 100%) * 999, 100%)',
                                                    flexGrow: 1,
                                                },
                                            }}
                                        >
                                            <Typography level="h1" fontSize="xl4">
                                                Work Posts
                                            </Typography>
                                            <Box sx={{ flex: 999 }} />
                                            <Box sx={{ display: 'flex', gap: 1, '& > *': { flexGrow: 1 } }}>
                                                <Link to={config.routes.createWork} state={{ type: 'create' }}>
                                                    <Button
                                                        variant="outlined"
                                                        color="neutral"
                                                        startDecorator={<AddRegular />}
                                                    >
                                                        Post work
                                                    </Button>
                                                </Link>
                                            </Box>
                                        </Box>
                                        <WorksTable />
                                    </Box>
                                </Box>
                            </Card>
                        </Col>

                        {/* Bio card */}
                        <Col xs={0} md={3}>
                            <Card
                                variant="outlined"
                                sx={{
                                    width: 320,
                                    maxWidth: '100%',
                                }}
                            >
                                <CardContent sx={{ alignItems: 'center', textAlign: 'center' }}>
                                    <Avatar src="/static/images/avatar/1.jpg" sx={{ '--Avatar-size': '4rem' }} />
                                    <Chip
                                        size="sm"
                                        variant="soft"
                                        color="primary"
                                        sx={{ mt: -1, border: '3px solid', borderColor: 'background.surface' }}
                                    >
                                        PRO
                                    </Chip>
                                    <Typography fontSize="lg" fontWeight="lg" sx={{ mt: 1, mb: 0.5 }}>
                                        Tien Le
                                    </Typography>
                                    <Typography level="body2" sx={{ maxWidth: '24ch' }}>
                                        Hello, this is my bio and I am a PRO member of Freelance dApp. I am a developer
                                        and I love to code.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </Box>
        </div>
    )
}

export default WorkDashboard
