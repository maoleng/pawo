import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { isAfter, isBefore } from 'date-fns'
import classNames from 'classnames/bind'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Avatar from '@mui/joy/Avatar'
import Box from '@mui/joy/Box'
import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import CardActions from '@mui/joy/CardActions'
import IconButton from '@mui/joy/IconButton'
import Typography from '@mui/joy/Typography'
import Chip from '@mui/joy/Chip'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import Input from '@mui/joy/Input'
import Rating from '@mui/material/Rating'
import { SearchRegular } from '@fluentui/react-icons'

import { WalletContext } from '../../App'
import { axiosInstance } from '../../utils/axiosInstance'
import Banner from '../../pages/components/Banner'
import LoadingSkeleton from '../../pages/components/LoadingSkeleton'
import config from '../../config'
import styles from './FindWork.module.scss'

const cx = classNames.bind(styles)

function FindWork() {
    const { contractId, wallet } = useContext(WalletContext)
    const [workList, setWorkList] = useState(null)

    useEffect(() => {
        ;(async () => {
            await axiosInstance({
                method: 'GET',
                url: `job?_filter=status:0&_fields=title,description,categories,money,creatorId,status,freelancerId,startedAt,finishedAts,deadline,createdAt&_noPagination=1`,
            })
                .then((res) => {
                    if (res.data.status) {
                        setWorkList([...res.data.data])
                    }
                    console.log(res)
                })
                .catch((res) => {
                    console.log(res)
                })
        })()
    }, [])

    function dateComparator(firstWork, secondWork) {
        console.log(firstWork)
        console.log(secondWork)
        const first = new Date(firstWork?.createdAt)
        const second = new Date(secondWork?.createdAt)
        if (isAfter(first, second)) {
            return -1
        }
        if (isBefore(first, second)) {
            return 1
        }
        return 0
    }

    function starComparator(firstWork, secondWork) {
        const first = firstWork?.star !== null ? firstWork?.star : 4.0
        const second = secondWork?.star !== null ? secondWork?.star : 4.0

        if (isAfter(first, second)) {
            return -1
        }
        if (isBefore(first, second)) {
            return 1
        }
        return 0
    }

    const orderNewestCreatedDateHandler = () => {
        if (workList === null) {
            return []
        }

        const newWork = [...workList]
        setWorkList(newWork.sort(dateComparator))
    }

    const orderBestEmployerHandler = () => {
        if (workList === null) {
            return []
        }

        const newWork = [...workList]
        setWorkList(newWork.sort(starComparator))
    }

    return (
        <div>
            <Container>
                <Row>
                    {/* Banner */}
                    <Col xs={12} className={cx('banner-wrapper')}>
                        <Banner title="Browse Work" />
                    </Col>

                    {/* Works grid */}
                    <Col xs={12} md={9}>
                        <Card
                            variant="outlined"
                            sx={{
                                width: '100%',
                            }}
                            className={cx('work-wrapper')}
                        >
                            <Box
                                sx={{
                                    borderRadius: 'sm',
                                    py: 2,
                                    display: {
                                        xs: 'none',
                                        sm: 'flex',
                                    },
                                    flexWrap: 'wrap',
                                    gap: 1.5,
                                    '& > *': {
                                        minWidth: {
                                            xs: '120px',
                                            md: '160px',
                                        },
                                    },
                                }}
                            >
                                <FormControl sx={{ flex: 1 }} size="lg">
                                    <FormLabel>Search for work</FormLabel>
                                    <Input
                                        placeholder="Search"
                                        startDecorator={<SearchRegular />}
                                        sx={{ '--Icon-fontSize': '2rem', '--Input-focusedHighlight': '#1100ff' }}
                                    />
                                </FormControl>
                                <FormControl size="lg">
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        placeholder="Sort by"
                                        sx={{
                                            py: 0,
                                        }}
                                        // slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                                    >
                                        <Option value="paid" onClick={orderNewestCreatedDateHandler}>
                                            Newest works
                                        </Option>
                                        <Option value="pending" onClick={orderBestEmployerHandler}>
                                            Best employers
                                        </Option>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Card>
                        {workList ? (
                            workList.map((work) => (
                                <Card
                                    variant="outlined"
                                    sx={{
                                        width: '100%',
                                    }}
                                    className={cx('work-wrapper')}
                                    key={work.id}
                                >
                                    <CardContent>
                                        <Box>
                                            <Row>
                                                <Col xs={12}>
                                                    <h5 className={cx('work-title')}>{work.title}</h5>
                                                </Col>
                                                <Col xs={12}>
                                                    <small className={cx('work-subtitle')}>
                                                        <span
                                                            className={cx('work-subtitle_price')}
                                                        >{`Fixed price: $${work.money}`}</span>
                                                        <span>
                                                            &nbsp;-&nbsp;<span>Entry level</span>
                                                        </span>
                                                    </small>
                                                </Col>
                                            </Row>
                                        </Box>
                                        <Box>
                                            <p className={cx('work-desc')}>{work.description}</p>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                marginTop: '10px',
                                            }}
                                        >
                                            {work.categories.map((category, index) => (
                                                <Chip
                                                    variant="soft"
                                                    color="neutral"
                                                    size="lg"
                                                    sx={{ pointerEvents: 'none' }}
                                                    key={index}
                                                >
                                                    {category}
                                                </Chip>
                                            ))}
                                        </Box>
                                    </CardContent>
                                    <CardActions buttonFlex="0 1 120px">
                                        <Box sx={{ mr: 'auto' }}>
                                            <IconButton variant="outlined" color="neutral" sx={{ mr: 1 }}>
                                                <FavoriteBorder />
                                            </IconButton>
                                            <Rating value={work?.star} readOnly sx={{ color: '#1100ff' }} />
                                        </Box>
                                        <Link
                                            to={config.routes.sendProposal}
                                            state={{ work: work }}
                                            className={cx('send-btn', 'btn', 'rounded-pill', 'btn-outline-style')}
                                        >
                                            Send proposal
                                        </Link>
                                    </CardActions>
                                </Card>
                            ))
                        ) : (
                            <LoadingSkeleton />
                        )}
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
                                    {wallet.accountId}
                                </Typography>
                                <Typography level="body2" sx={{ maxWidth: '24ch' }}>
                                    Hello, this is my bio and I am a PRO member of Freelance dApp. I am a developer and
                                    I love to code.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default FindWork
