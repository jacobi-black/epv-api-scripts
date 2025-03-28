import React, { useState } from "react";
import { Tooltip, IconButton, styled } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    maxWidth: 220,
    fontSize: "0.85rem",
    border: "1px solid",
    borderColor: theme.palette.primary.light,
    borderRadius: "8px",
    padding: "10px 12px",
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.2)",
  },
  [`& .MuiTooltip-arrow`]: {
    color: theme.palette.primary.main,
  },
}));

const HelpIcon = styled(HelpOutlineIcon)(({ theme }) => ({
  fontSize: "1.1rem",
  color: theme.palette.grey[600],
  "&:hover": {
    color: theme.palette.primary.main,
  },
}));

/**
 * Composant affichant une infobulle contextuelle au survol d'un élément
 *
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Élément auquel associer le tooltip (optionnel)
 * @param {string} props.title - Contenu textuel du tooltip
 * @param {string} props.placement - Position du tooltip (top, bottom, left, right)
 * @param {boolean} props.showIcon - Afficher ou non l'icône d'aide (true par défaut)
 * @param {Object} props.iconProps - Propriétés supplémentaires pour l'icône
 */
const ContextualTooltip = ({
  children,
  title,
  placement = "top",
  showIcon = true,
  iconProps = {},
  ...props
}) => {
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  // Si aucun enfant n'est fourni, utiliser l'icône d'aide par défaut
  if (!children && showIcon) {
    return (
      <StyledTooltip title={title} placement={placement} arrow {...props}>
        <IconButton
          size="small"
          aria-label="aide"
          onMouseEnter={handleTooltipOpen}
          onMouseLeave={handleTooltipClose}
          onClick={(e) => e.stopPropagation()}
          sx={{ ml: 0.5, p: 0.5 }}
          {...iconProps}
        >
          <HelpIcon fontSize="small" />
        </IconButton>
      </StyledTooltip>
    );
  }

  // Si des enfants sont fournis, afficher le tooltip au-dessus d'eux
  return (
    <StyledTooltip title={title} placement={placement} arrow {...props}>
      {children}
    </StyledTooltip>
  );
};

export default ContextualTooltip;
