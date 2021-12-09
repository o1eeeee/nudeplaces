import styles from '../styles/components/Checkbox.module.css'

export default function Checkbox({ name, label, value, onChange }) {
    return (
        <label className={styles.checkbox}>
            <input type="checkbox" name={name} checked={value} onChange={onChange} />
            {label}
        </label>
    );
};