import Alert from '@mui/joy/Alert'
import Box from '@mui/joy/Box'
import { ErrorCircleRegular } from '@fluentui/react-icons'

function ErrorMessage({ message = 'Something went wrong' }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            <Alert variant="soft" color="danger" startDecorator={<ErrorCircleRegular />}>
                {message}
            </Alert>
        </Box>
    )
}

export default ErrorMessage
