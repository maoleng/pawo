import { useEffect } from 'react'
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

function WorkDashboard() {

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
                        <Col xs={12}>
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
                    </Row>
                </Container>
            </Box>
        </div>
    )
}

export default WorkDashboard
