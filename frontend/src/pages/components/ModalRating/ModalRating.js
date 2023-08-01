import { Fragment, useState } from 'react'
import Button from '@mui/joy/Button'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input'
import Modal from '@mui/joy/Modal'
import ModalDialog from '@mui/joy/ModalDialog'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'
import Rating from '@mui/material/Rating'

function ModalRating({
    title = 'Rating',
    message = 'Please rate your partner.',
    open,
    setOpen = () => {},
    submitFormHandler = () => {},
}) {
    const [star, setStar] = useState(5)

    return (
        <Fragment>
            <Modal open={open} onClose={() => setOpen(false)}>
                <ModalDialog
                    aria-labelledby="edit-modal-title"
                    aria-describedby="basic-modal-dialog-description"
                    sx={{ minWidth: 500 }}
                >
                    <Typography id="edit-modal-title" component="h2">
                        {title}
                    </Typography>
                    <Typography id="basic-modal-dialog-description" textColor="text.tertiary">
                        {message}
                    </Typography>
                    <form onSubmit={submitFormHandler}>
                        <Stack spacing={2}>
                            <FormControl sx={{ alignItems: 'center' }}>
                                <Rating
                                    name="starRating"
                                    value={star}
                                    onChange={(e, newValue) => {
                                        setStar(newValue)
                                    }}
                                    sx={{ py: 2, color: '#1100ff', fontSize: '3.6rem' }}
                                    size="large"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Message to client</FormLabel>
                                <Input
                                    autoFocus
                                    slotProps={{
                                        input: {
                                            name: 'commentRating',
                                        },
                                    }}
                                    required
                                />
                            </FormControl>
                            <Button
                                type="submit"
                                sx={{ p: '12px 24px' }}
                            >
                                Confirm
                            </Button>
                        </Stack>
                    </form>
                </ModalDialog>
            </Modal>
        </Fragment>
    )
}

export default ModalRating
